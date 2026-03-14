const express = require("express");
const TransactionRouter = express.Router();
const authMiddleware = require("../middlewares/auth.middlewares");
const transactionController = require("../controllers/transaction.controller");

TransactionRouter.post(
  "/",
  authMiddleware.authMiddleware,
  transactionController.createTransaction
);

module.exports = TransactionRouter;
