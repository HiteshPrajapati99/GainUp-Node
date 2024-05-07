import express from "express";
import { db } from "./services/DB.js";
import cors from "cors";
import expressUpload from "express-fileupload";
import { nodeSchedule } from "./services/cron.js";

// express
const app = express();
app.use("/public", express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(expressUpload());

nodeSchedule();
// Node Sschedule
// app.use(nodeSchedule());

// dataBase connect
db.getConnection()
  .then(() => {
    console.log("Database Connencted...");
  })
  .catch((err) => {
    console.log("Database disconnected...", err);
  });

app.get("/", (req, res) => {
  res.json("server is working....");
});

import allRoutes from "./routes/index.js";

app.use("/api/", allRoutes);

import { errorhandler } from "./middlewares/errorHandler.js";
app.use(errorhandler);

app.listen(5000, () => {
  console.log("Server is runnig....");
});

// queueMicrotask(() => {
//   console.log("call first alwasy");
// });
