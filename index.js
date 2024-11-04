const express = require("express");
const expressListRoutes = require("express-list-routes");
const { Sequelize } = require("sequelize");
const cors = require("cors");
var cron = require("node-cron");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

const sequelize = new Sequelize("voting_system", "root", "root@123", {
  host: "localhost",
  dialect: "mysql",
});

const app = express();

const users = require("./routes/users");
const auth = require("./routes/auth");
const election = require("./routes/election");
const { closeElection } = require("./controllers/election");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

app.use("/user", users);
app.use("/auth", auth);
app.use("/election", election);

app.use("/uploads", express.static("uploads"));

app.get("/", function (req, res) {
  res.json({ message: "hello from express" });
});

const initDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

initDB();

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});

cron.schedule("0 * * * *", () => {
  console.log("running a task every hour");
  closeElection();
});

expressListRoutes(app);
