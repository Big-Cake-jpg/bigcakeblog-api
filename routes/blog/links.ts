import axios from "axios";
import { Router } from "express";
import { MongoClient } from "mongodb";
import "dotenv/config";
import chalk from "chalk";

const CONNECTION_STRING = process.env.CONNECTION_STRING || "";

export const linksRoute = Router();

linksRoute.get("/inpage", async (req, res) => {
  try {
    const response = await axios.get(
      "https://r2-static-prod-1.putton.net/bigcake-friends.2cab7553-c5b1-4b81-99dd-8bc92b30e154.json"
    );
    res.send(response.data);
  } catch (error) {
    console.log(
      chalk.redBright(
        `[ERROR] Failed to fetch inpage links from Cloudflare R2.`
      ),
      error
    );
    res.status(500).send({ success: false, code: 500, message: "招待…不周……" });
  }
});

linksRoute.get("/global", async (req, res) => {
  try {
    const client = await MongoClient.connect(CONNECTION_STRING);
    const db = await client.db("Links");
    const result = await db.collection("global").find().toArray();
    res.send(result);
  } catch (error) {
    console.log(
      chalk.redBright(
        `[ERROR] Failed to fetch global links from MongoDB Cloud.`
      ),
      error
    );
    res.status(500).send({ success: false, code: 500, message: "招待…不周……" });
  }
});

linksRoute.get("/original", async (req, res) => {
  try {
    const response = await axios.get(
      "https://raw.githubusercontent.com/Big-Cake-jpg/friends-links/main/links.json"
    );
    res.send(response.data);
  } catch (error) {
    console.log(
      chalk.redBright(
        `[ERROR] Failed to fetch original links from GitHub Raw.`
      ),
      error
    );
    res.status(500).send({ success: false, code: 500, message: "招待…不周……" });
  }
});
