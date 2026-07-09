const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // Not required for Google OAuth users
  },
  role: {
    type: String,
    default: "user",
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
});

// Create index for faster email lookups during login
UserSchema.index({ email: 1 });

const User = mongoose.model("User", UserSchema);
module.exports = User;
