import express from "express";
import { linksRoute } from "../routes/blog/links.js";
import pkg from "../package.json" assert { type: "json" };

const app = express();
const router = express.Router();

// index
router.all("/", (req, res) => {
  res.send({
    success: true,
    code: 200,
    message: "愿此行，终抵群星。",
    version: pkg.version,
  });
});

// 友链
router.use("/blog/links", linksRoute);

// 全局捕获
router.use((req, res) => {
  res.status(404).send({ success: false, code: 404, message: "这位客人，请别生气……" });
});

export const routes = router
