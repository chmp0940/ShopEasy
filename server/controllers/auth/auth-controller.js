const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

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

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
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
    if (!email && !password) {
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
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );
    // console.log(token);

    // console.log(checkUser.role);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      })
      .json({
        success: true,
        message: "Logged in SuccessFully",
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

//logout
const logoutUser=async(req,res,next)=>{
  res.clearCookie("token").json({
    success:true,
    message:"logged out successfully",
  })
}

//auth middleware
const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};



module.exports = { registerUser, loginUser,logoutUser ,authMiddleware};
