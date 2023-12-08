const express = require("express");
const Expense = require("../models/expense");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/expense", auth, async (req, res) => {
  const expense = new Expense({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await expense.save();
    res.status(201).send(expense);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/expense/", auth, async (req, res) => {
  //const year = parseInt(req.params.year);
  try {
    const expenseInYear = await Expense.find({
      owner: req.user._id,
    });
    res.send(expenseInYear);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.get("/expense/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const expense = await Expense.findOne({ _id, owner: req.user._id });
    if (!expense) {
      return res.sendStatus(404).send();
    }
    res.send(expense);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/expense/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "amount", "category", "month", "year"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const expense = await Expense.findOne({ _id, owner: req.user._id });
    if (!expense) {
      return res.status(404).send();
    }
    updates.forEach((update) => (expense[update] = req.body[update]));
    await expense.save();
    res.send(expense);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/expense/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const expense = await Expense.findOneAndDelete({
      _id,
      owner: req.user._id,
    });
    if (!expense) {
      return res.sendStatus(404).send();
    }
    res.send(expense);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
