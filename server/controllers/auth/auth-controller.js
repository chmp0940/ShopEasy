const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { createClerkClient, verifyToken } = require("@clerk/express");

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    if (!userName || !email || !password) {
      res.status(501).json({
        success: false,
        message: "pls fill all the details",
      });
    }
    const tempUser = await User.findOne({
      email,
    });
    if (tempUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with the smae email id ",
      });
    }

    const hashPassword = await bcrypt.hash(password, 4); // Low rounds = fast hashing (portfolio project)

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      authProvider: "local",
    });
    await newUser.save();
    res.status(200).json({
      success: true,
      message: "Registration Successfull",
      user: {
        userName: newUser.userName,
        email: newUser.email,
        _id: newUser._id,
      },
    });
  } catch (e) {
    // console.log(e);
    res.status(500).json({
      success: false,
      message: "Some Error occured",
    });
  }
};

//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(500).json({
        success: false,
        message: "Pls fill all the details",
      });
    }
    const checkUser = await User.findOne({ email });
    if (!checkUser) {
      return res.status(500).json({
        success: false,
        message: "User doesn't exists with this email id Pls register first",
      });
    }

    // If user signed up with Google, tell them to use Google login
    if (checkUser.authProvider === "google" && !checkUser.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please use the Google button to log in.",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch) {
      return res.status(500).json({
        success: false,
        message: "Incorrect Password Pls Try Again",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in Successfull",
      token,
      user: {
        email: checkUser.email,
        id: checkUser._id,
        role: checkUser.role,
        userName: checkUser.userName,
      },
    });
  } catch (e) {
    // console.log(e);
    res.status(500).json({
      success: false,
      message: "Some Error occured",
    });
  }
};

// Google OAuth login — verifies Clerk token, finds or creates user, issues our JWT
const googleLogin = async (req, res) => {
  try {
    // Get Clerk session token from Authorization header
    const authHeader = req.headers["authorization"];
    const clerkToken = authHeader && authHeader.split(" ")[1];

    if (!clerkToken) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    // Verify the Clerk session token
    let verifiedToken;
    try {
      verifiedToken = await verifyToken(clerkToken, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });
    } catch (verifyError) {
      console.log("Clerk token verification failed:", verifyError.message);
      return res.status(401).json({
        success: false,
        message: "Invalid Google authentication token",
      });
    }

    // Get user details from Clerk
    const clerkUser = await clerkClient.users.getUser(verifiedToken.sub);

    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    const name =
      `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
      email.split("@")[0];

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "No email found in Google account",
      });
    }

    // Find or create user in our database
    let user = await User.findOne({ email });

    if (!user) {
      // New user — create account
      user = new User({
        userName: name,
        email,
        authProvider: "google",
      });
      await user.save();
    }
    // If user exists (even with local auth), let them login with Google too (account linking)

    // Issue our own JWT
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in with Google successfully",
      token,
      user: {
        email: user.email,
        id: user._id,
        role: user.role,
        userName: user.userName,
      },
    });
  } catch (error) {
    console.log("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Google authentication failed. Please try again.",
    });
  }
};

//logout
const logoutUser = async (req, res, next) => {
  res.clearCookie("token").json({
    success: true,
    message: "logged out successfully",
  });
};

//auth middleware
// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;
//   if (!token)
//     return res.status(401).json({
//       success: false,
//       message: "Unauthorised user!",
//     });

//   try {
//     const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
//     req.user = decoded;
//     next();
//   } catch (error) {
//     res.status(401).json({
//       success: false,
//       message: "Unauthorised user!",
//     });
//   }
// };

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "CLIENT_SECRET_KEY"
    );
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  googleLogin,
};
