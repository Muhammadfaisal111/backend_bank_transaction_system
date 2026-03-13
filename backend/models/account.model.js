const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "account must belong to a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "frozen"],
        message: "Status must be either active, inactive or frozen",
        
      },
      default: "active",
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "PKR",
    },
  },
  { timestamps: true }
);

accountSchema.index({ user: 1 }, { status: 1 });

const accountModel = mongoose.model("Account", accountSchema);
module.exports = accountModel;
