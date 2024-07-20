import "dotenv/config";
import chalk from "chalk";
import express from "express";
import { routes } from "./modules/router.js";

const port = process.env.APP_PORT;
const app = express();

app.use(express.static("public"));

app.use("/", routes);

app.listen(port, () => {
  console.log(
    chalk.green(`[INFO] API now listening on port ${port}`)
  );
});
