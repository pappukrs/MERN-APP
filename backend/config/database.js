// const mongoose = require("mongoose");
// mongo_url = "mongodb://127.0.0.1.27017/media";
// require("dotenv").config({ path: "./.env" });
// mongoose.set("strictQuery", false);
// const connectDatabases = async () => {
//   try {
//     await mongoose.connect(mongo_url);
//     console.log("Connecting to db");
//   } catch (err) {
//     console.log("Error connecting to db");
//   }
// };

// module.exports = connectDatabases;
mongo_url = "mongodb://127.0.0.1:27017/media";

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const connection = mongoose.connect(mongo_url);
module.exports = connection;
