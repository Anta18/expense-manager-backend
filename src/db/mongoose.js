const mongoose = require("mongoose");

const connectionURL = process.env.MONGODB_URL;

mongoose
  .connect(connectionURL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));
