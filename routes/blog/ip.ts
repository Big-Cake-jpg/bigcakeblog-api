import axios from "axios";
import { Router } from "express";
import "dotenv/config";
import chalk from "chalk";

export const ipRoute = Router();

ipRoute.get("/ischina", async (req, res) => {
  try {
    const remoteIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const response = await axios.get(
      `https://api.ip2location.io/?ip=${remoteIp}&key=${process.env.IP2LOCATION_API_KEY}&package=WS25`,
      {
        proxy: false,
      }
    );

    res.send({
      success: true,
      code: 200,
      data: { isChina: response.data.country_code === "CN" },
    });
  } catch (error) {
    console.log(
      chalk.redBright(
        `[ERROR] Failed to check IP location.`
      ),
      error
    );
    res.status(500).send({ success: false, code: 500, message: "招待…不周……" });
  }
});
