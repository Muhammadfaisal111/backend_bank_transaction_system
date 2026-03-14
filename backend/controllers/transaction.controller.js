const transactionModel = require('../models/transaction.model');
const accountModel = require('../models/account.model');

// step one is to check if the request body has all the required fields
async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // step two is to check if the fromAccount and toAccount have accounts in the database
  const fromUserAccount = await accountModel.findOne({ _id: fromAccount });
  const toUserAccount = await accountModel.findOne({ _id: toAccount });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(404).json({ message: "Account not found" });
  }

  // step three is to check the idempotency key if it already exists in the database
  const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "completed") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTransactionAlreadyExists
      });

    } else if (isTransactionAlreadyExists.status === "pending") {
      return res.status(200).json({
        message: "Transaction is pending",
        transaction: isTransactionAlreadyExists
      });

    } else if (isTransactionAlreadyExists.status === "failed") {
      return res.status(200).json({
        message: "Transaction already failed",
        transaction: isTransactionAlreadyExists
      });

    } else if (isTransactionAlreadyExists.status === "reversed") {
      return res.status(200).json({
        message: "Transaction already reversed",
        transaction: isTransactionAlreadyExists
      });
    }
  }
}