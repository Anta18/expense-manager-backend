const express = require("express");
const Income = require("../models/income");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/income", auth, async (req, res) => {
  const income = new Income({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await income.save();
    res.status(201).send(income);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/income/:year", auth, async (req, res) => {
  const year = parseInt(req.params.year);
  try {
    const incomeInYear = await Income.find({
      owner: req.user._id,
      year: year,
    });
    res.send(incomeInYear);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
});

router.get("/income/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const income = await Income.findOne({ _id, owner: req.user._id });
    if (!income) {
      return res.sendStatus(404).send();
    }
    res.send(income);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.patch("/income/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["amount", "source", "month", "year"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates" });
  }

  try {
    const income = await Income.findOne({ _id, owner: req.user._id });
    if (!income) {
      return res.status(404).send();
    }
    updates.forEach((update) => (income[update] = req.body[update]));
    await income.save();
    res.send(income);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/income/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const income = await Income.findOneAndDelete({
      _id,
      owner: req.user._id,
    });
    if (!income) {
      return res.sendStatus(404).send();
    }
    res.send(income);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
