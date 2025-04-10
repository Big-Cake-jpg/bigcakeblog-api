import "dotenv/config";
import chalk from "chalk";
import express from "express";
import { routes } from "./modules/router.ts";
import cors from "cors";

const port = process.env.APP_PORT;
const app = express();

app.use(express.static("public"));

app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:4859",
      /^https?:\/\/.*\.lihaoyu\.cn$/,
      /^https?:\/\/.*\.cakemc\.top$/,
      /^https?:\/\/.*\.230225\.xyz$/,
    ],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);

app.use("/", routes);

app.listen(port, () => {
  console.log(chalk.green(`[INFO] API now listening on port ${port}`));
});
