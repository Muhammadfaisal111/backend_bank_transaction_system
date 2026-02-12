const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
async function registerUserController(req, res) {
  console.log(req.body);
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

module.exports = {
  registerUserController,
};
