import axios from "axios";
import { Router } from "express";
import "dotenv/config";
import chalk from "chalk";

export const modrinthRoute = Router();

const ua =
  process.env.MOSEARCH_USER_AGENT ||
  "Big-Cake-jpg/bigcakeblog-api/development (me@lihaoyu.cn)";
const apiRoot =
  process.env.MODRINTH_API_ROOT || "https://staging-api.modrinth.com";

const instance = axios.create({
  baseURL: apiRoot,
  timeout: 5000,
  headers: { "User-Agent": ua },
  proxy: false,
});

modrinthRoute.get("/", async (req, res) => {
  try {
    console.log(
      chalk.white(`[INFO] Fetching Modrinth info from Modrinth API.`)
    );
    const response = await instance.get("/");
    console.log(
      chalk.green(
        `[INFO] Successfully fetched Modrinth info from Modrinth API.`
      )
    );
    res.send(response.data);
  } catch (error) {
    console.log(
      chalk.redBright(
        `[ERROR] Failed to fetch Modrinth info from Modrinth API.`
      ),
      error
    );
    res.status(500).send({ success: false, code: 500, message: "招待…不周……" });
  }
});

modrinthRoute.get("/search", async (req, res) => {
  try {
    console.log(
      chalk.white(`[INFO] Fetching mods list info from Modrinth API.`)
    );
    var query = req.query;
    console.log(
        chalk.white(`[INFO] User query:`, query)
    );
    const response = await instance.get("/v2/search", {
      params: query,
    });
    console.log(
      chalk.green(`[INFO] Successfully fetched mods list from Modrinth API.`)
    );
    res.send(response.data);
  } catch (error) {
    console.log(
      chalk.redBright(`[ERROR] Failed to fetch mods list from Modrinth API.`),
      error
    );
    res.status(500).send({ success: false, code: 500, message: "招待…不周……" });
  }
});
