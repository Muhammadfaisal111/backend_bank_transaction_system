const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

// Register
async function registerUserController(req, res) {
  const { email, name, password } = req.body;
  const isExist = await userModel.findOne({ email });
  if (isExist) {
    return res.status(422).json({ message: "User already exist" });
  }
  const user = await userModel.create({
    email,
    name,
    password,
  });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token);
  res.status(201).json({
    user: { _id: user._id, email: user.email, name: user.name },
    token,
  });
}

// Login
async function loginUserController(req, res) {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user) {
    return res.status(404).json({ message: "email or password is invalid" });
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(404).json({ message: "email or password is invalid" });
  }
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  res.cookie("token", token);
  res.status(201).json({
    user: { _id: user._id, email: user.email, name: user.name },
    token,
  });
}
// Export outside functions
module.exports = {
  registerUserController,
  loginUserController,
};
