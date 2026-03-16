const express = require("express");

const authMiddleware = require("../middlewares/auth.middlewares");
const createAccountController = require("../controllers/account.controller");

const router = express.Router();
// Create account for logged in user
router.post(
  "/",
  authMiddleware.authMiddleware,
  createAccountController.createAccountController
);

// Get all accounts for logged in user
router.get(
  "/",
  authMiddleware.authMiddleware,
  createAccountController.getUserAccountsController
);

// Get account balance for a specific account
router.get(
  "/balance/:accountId",
  authMiddleware.authMiddleware,
  createAccountController.getAccountBalanceController
);

module.exports = router;
