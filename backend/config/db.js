const mongoose = require("mongoose");
function connectDB() {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = connectDB;
