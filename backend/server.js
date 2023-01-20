const server = require("./app");
const dotenv = require("dotenv");
const connection = require("./config/database");
dotenv.config({ path: "./config/.env" });
const port = process.env.PORT || 3000;
// console.log(server);

server.listen(port, async (req, res) => {
  try {
    await connection;
    console.log("Connected to db");
  } catch (error) {
    res.status(404).json({ message: error.message });
  }

  console.log(`server running on port ${port}`);
});
