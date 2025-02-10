const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://cse12312sbit:esCHg8HKfVHpqCr@cluster0.dazqv.mongodb.net/developersTinder"
  );
};

module.exports = connectDB;
