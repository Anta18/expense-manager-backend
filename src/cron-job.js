const cron = require("node-cron");
const mongoose = require("mongoose");
const Expense = require("./models/expense");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");

    // Schedule a task to run every day at midnight
    cron.schedule("0 0 * * *", async () => {
      console.log("Running the cron job to generate recurring expenses");
      await Expense.generateRecurringExpenses();
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
