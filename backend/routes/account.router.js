const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const createAccountController = require("../controllers/account.controller");

router.post(
  "/",
  authMiddleware.authMiddleware,
  createAccountController.createAccountController
);

module.exports = router;
