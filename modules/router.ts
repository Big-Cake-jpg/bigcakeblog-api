import express from "express";
import { linksRoute } from "../routes/blog/links.js";
import { modrinthRoute } from "../routes/mosearch/v0/modrinth.js";
import { mcmtRoute } from "../routes/mod-translations/v1/name.js";
import pkg from "../package.json" assert { type: "json" };
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const router = express.Router();
const swaggerDocument = YAML.load('./routes/mod-translations/openapi.yaml');

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

// MoSearch
router.use("/mosearch/v0/modrinth", modrinthRoute);

// MC Mod Translate
router.use("/mod-translations/v1", mcmtRoute);
router.use('/mod-translations/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 全局捕获
router.use((req, res) => {
  res.status(404).send({ success: false, code: 404, message: "这位客人，请别生气……" });
});

export const routes = router
