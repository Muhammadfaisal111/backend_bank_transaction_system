const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "legder must we associated with account"],
    index: true,
    immutable: true
  },
  amount: {
    type: Number,
    required: [true, "amount is required"],
    immutable: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: [true, "ledger must be associated with a transaction"],
    index: true,
    immutable: true
  },
  type: {
    type: String,
    enum: {
      values: ["debit", "credit"],
      message: "type must be either debit or credit",
    },
    required: [true, "type is required"],
    immutable: true
  },
}, { timestamps: true });


function preventLedgerModification() {
  throw new Error("Ledger entries cannot be modified or deleted");
}
ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);

const ledgerModel = mongoose.model("Ledger", ledgerSchema);
module.exports = ledgerModel;




