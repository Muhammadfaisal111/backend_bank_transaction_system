const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");
const ledgerModel = require("../models/ledger.model");
const mongoose = require("mongoose");
const emailService = require("../services/email.services");

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
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "completed") {
      return res.status(200).json({
        message: "Transaction already completed",
        transaction: isTransactionAlreadyExists,
      });
    } else if (isTransactionAlreadyExists.status === "pending") {
      return res.status(200).json({
        message: "Transaction is pending",
        transaction: isTransactionAlreadyExists,
      });
    } else if (isTransactionAlreadyExists.status === "failed") {
      return res.status(200).json({
        message: "Transaction already failed",
        transaction: isTransactionAlreadyExists,
      });
    } else if (isTransactionAlreadyExists.status === "reversed") {
      return res.status(200).json({
        message: "Transaction already reversed",
        transaction: isTransactionAlreadyExists,
      });
    }
  }

  //step four is to check that user account status is active
  if (
    fromUserAccount.status !== "active" ||
    toUserAccount.status !== "active"
  ) {
    return res.status(400).json({ message: "Both accounts must be active" });
  }

  // step five is to check if the fromAccount has sufficient balance to make the transaction
  const balance = await fromUserAccount.getBalance();

  if (balance < amount) {
    return res.status(400).json({
      message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  let transaction;
  try {
    /**
     * 5. Create transaction (PENDING)
     */
    const session = await mongoose.startSession();
    session.startTransaction();

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        { session }
      )
    )[0];

    const debitLedgerEntry = await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session }
    );

    await (() => {
      return new Promise((resolve) => setTimeout(resolve, 15 * 1000));
    })();

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session }
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
  } catch (error) {
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, please retry after sometime",
    });
  }
  /**
   * 10. Send email notification
   */
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toAccount
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}


async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body

  if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
          message: "toAccount, amount and idempotencyKey are required"
      })
  }

  const toUserAccount = await accountModel.findOne({
      _id: toAccount,
  })

  if (!toUserAccount) {
      return res.status(400).json({
          message: "Invalid toAccount"
      })
  }

  const fromUserAccount = await accountModel.findOne({
      user: req.user._id
  })

  if (!fromUserAccount) {
      return res.status(400).json({
          message: "System user account not found"
      })
  }


  const session = await mongoose.startSession()
  session.startTransaction()

  const transaction = new transactionModel({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING"
  })

  const debitLedgerEntry = await ledgerModel.create([ {
      account: fromUserAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT"
  } ], { session })

  const creditLedgerEntry = await ledgerModel.create([ {
      account: toAccount,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT"
  } ], { session })

  transaction.status = "COMPLETED"
  await transaction.save({ session })

  await session.commitTransaction()
  session.endSession()

  return res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction
  })


}

module.exports = {
  createTransaction,
  createInitialFundsTransaction
};
