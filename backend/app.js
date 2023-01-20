const express = require("express");
const app = express();
const cookie = require("cookie-parser");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "./config/.env" });
}

//using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Importing Routes
const Postrouter = require("./routes/post.js");
const Userrouter = require("./routes/user.js");
//Using Routes
app.use("/api/v1", Postrouter);
app.use("/api/v1", Userrouter);

module.exports = app;
