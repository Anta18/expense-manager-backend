const mongoose = require("mongoose");

const incomeSchema = new mongoose.Schema(
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

incomeSchema.statics.generateRecurringIncome = async function () {
  const today = new Date();
  const recurringIncome = await this.find({ recurring: true });

  for (const income of recurringIncome) {
    if (today < income.startDate) continue;

    if (income.endDate && today > income.endDate) continue;

    let nextOccurrence;
    switch (income.frequency) {
      case "Daily":
        nextOccurrence = new Date(income.startDate);
        nextOccurrence.setDate(
          nextOccurrence.getDate() +
            Math.floor((today - income.startDate) / (1000 * 60 * 60 * 24))
        );
        break;
      case "Weekly":
        nextOccurrence = new Date(income.startDate);
        nextOccurrence.setDate(
          nextOccurrence.getDate() +
            Math.floor((today - income.startDate) / (1000 * 60 * 60 * 24 * 7)) *
              7
        );
        break;
      case "Monthly":
        nextOccurrence = new Date(income.startDate);
        nextOccurrence.setMonth(
          nextOccurrence.getMonth() +
            Math.floor(
              (today.getFullYear() - income.startDate.getFullYear()) * 12 +
                today.getMonth() -
                income.startDate.getMonth()
            )
        );
        break;
      case "Yearly":
        nextOccurrence = new Date(income.startDate);
        nextOccurrence.setFullYear(
          nextOccurrence.getFullYear() +
            Math.floor(today.getFullYear() - income.startDate.getFullYear())
        );
        break;
      default:
        continue; // Unknown frequency, skip this income
    }

    // Check if the next occurrence is today
    if (
      nextOccurrence.getDate() === today.getDate() &&
      nextOccurrence.getMonth() === today.getMonth() &&
      nextOccurrence.getFullYear() === today.getFullYear()
    ) {
      // Create the income for today
      const newIncome = new this({
        title: income.title,
        amount: income.amount,
        category: income.category,
        date: today.toISOString().split("T")[0],
        owner: income.owner,
        recurring: false,
      });

      await newIncome.save();
      console.log(`Generated new income for today: ${income.title}`);
    }
  }
};

const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
