const express = require("express");
require("./db/mongoose");
const userRouter = require("./routers/user");
const expenseRouter = require("./routers/expense");
const incomeRouter = require("./routers/income");
const cors = require("cors");

const app = express();
app.use(cors());
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(expenseRouter);
app.use(incomeRouter);

app.listen(port, () => {
  console.log("Server set up on port", port);
});
