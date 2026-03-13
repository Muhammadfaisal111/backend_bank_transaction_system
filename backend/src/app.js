const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");


app.use(express.json());
app.use(cookieParser());

const authRouter = require("../routes/user.router");
const accountRouter = require("../routes/account.router");

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);

module.exports = app;
