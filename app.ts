import "dotenv/config";
import chalk from "chalk";
import express from "express";
import { routes } from "./modules/router.js";

const port = process.env.APP_PORT;
const app = express();

app.use(express.static("public"));

app.use("/", routes);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin.match(/^https?:\/\/([a-zA-Z0-9-]+\.)*lihaoyu\.cn$/)) {
      res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.listen(port, () => {
  console.log(
    chalk.green(`[INFO] API now listening on port ${port}`)
  );
});
