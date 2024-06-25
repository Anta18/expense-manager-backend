const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      default: "miscellaneous",
    },
    date: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["Daily", "Weekly", "Monthly", "Yearly"],
      required: function () {
        return this.recurring;
      }, // required if recurring is true
    },
    startDate: {
      type: Date,
      required: function () {
        return this.recurring;
      }, // required if recurring is true
    },
    endDate: {
      type: Date,
      required: false, // optional
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.statics.generateRecurringExpenses = async function () {
  const today = new Date();
  const recurringExpenses = await this.find({ recurring: true });

  for (const expense of recurringExpenses) {
    if (today < expense.startDate) continue;

    if (expense.endDate && today > expense.endDate) continue;

    let nextOccurrence;
    switch (expense.frequency) {
      case "Daily":
        nextOccurrence = new Date(expense.startDate);
        nextOccurrence.setDate(
          nextOccurrence.getDate() +
            Math.floor((today - expense.startDate) / (1000 * 60 * 60 * 24))
        );
        break;
      case "Weekly":
        nextOccurrence = new Date(expense.startDate);
        nextOccurrence.setDate(
          nextOccurrence.getDate() +
            Math.floor(
              (today - expense.startDate) / (1000 * 60 * 60 * 24 * 7)
            ) *
              7
        );
        break;
      case "Monthly":
        nextOccurrence = new Date(expense.startDate);
        nextOccurrence.setMonth(
          nextOccurrence.getMonth() +
            Math.floor(
              (today.getFullYear() - expense.startDate.getFullYear()) * 12 +
                today.getMonth() -
                expense.startDate.getMonth()
            )
        );
        break;
      case "Yearly":
        nextOccurrence = new Date(expense.startDate);
        nextOccurrence.setFullYear(
          nextOccurrence.getFullYear() +
            Math.floor(today.getFullYear() - expense.startDate.getFullYear())
        );
        break;
      default:
        continue; // Unknown frequency, skip this expense
    }

    // Check if the next occurrence is today
    if (
      nextOccurrence.getDate() === today.getDate() &&
      nextOccurrence.getMonth() === today.getMonth() &&
      nextOccurrence.getFullYear() === today.getFullYear()
    ) {
      // Create the expense for today
      const newExpense = new this({
        title: expense.title,
        amount: expense.amount,
        category: expense.category,
        date: today.toISOString().split("T")[0],
        owner: expense.owner,
        recurring: false,
      });

      await newExpense.save();
      console.log(`Generated new expense for today: ${expense.title}`);
    }
  }
};

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
