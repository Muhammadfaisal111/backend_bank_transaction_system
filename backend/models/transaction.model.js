const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      //fromAccount must be different from toAccount
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must have a source account"],
      index: true,
    },
    toAccount: {
      //toAccount must be different from fromAccount
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Transaction must have a destination account"],
      index: true,
    },
    status: {
      //status must be either pending, completed or failed
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "reversed"],
        message: "Status must be either pending, completed or failed",
      },
      default: "pending",
    },
    amount: {
      //amount must be a positive number
      type: Number,
      required: [true, "Transaction must have an amount"],
      min: [0, "Amount must be a positive number"],
    },
    idempotencyKey: {
      //user donot do the same transaction twice by mistake
      type: String,
      required: [true, "Transaction must have an idempotency key"],
      unique: true,
      index: true,
    },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("Transaction", transactionSchema);
module.exports = transactionModel;
