import { Router } from "express";
import "dotenv/config";
import chalk from "chalk";
import postgres from "postgres";

export const mcmtRoute = Router();

const db = process.env.MCMT_DB_URL || "";

const version = "1.0.0";

const sql = postgres(db);

mcmtRoute.get("/", async (req, res) => {
  res.send({
    success: true,
    code: 200,
    version: version,
    message: "Minecraft 模组名称翻译数据库 API",
    docs: "https://api.lihaoyu.cn/mod-translations/docs",
  });
});

mcmtRoute.get("/name", async (req, res) => {
  try {
    console.log(
      chalk.white(`[INFO] Fetching mod translations info from database.`)
    );

    const query_slug = req.query.slug as string;

    console.log(chalk.cyan(`[INFO] User query: ${query_slug}`));

    if (!query_slug) {
      console.log(
        chalk.yellowBright(
          `[WARN] No slug provided for mod translations info query.`
        )
      );
      res.status(400).send({
        success: false,
        code: 400,
        message: "未提供 slug 参数",
      });
      return;
    }

    const modIdQuery =
      await sql`SELECT mod_id FROM public.mod_slugs WHERE slug_name = ${query_slug}`;

    if (modIdQuery.count === 0) {
      console.log(
        chalk.yellowBright(
          `[WARN] Cannot find mod translations info for given slug ${query_slug} from database.`
        )
      );
      res.status(404).send({
        success: false,
        code: 404,
        message: "无法找到对应的 Mod 翻译信息",
      });
      return;
    }

    const modId = modIdQuery[0].mod_id;

    console.log(chalk.cyan(`[INFO] Found mod ID: ${modId}`));

    const modInfoQuery =
      await sql`SELECT mod_name, mod_translation FROM public.mods WHERE mod_id = ${modId}`;

    if (modInfoQuery.count === 0) {
      console.log(
        chalk.yellowBright(
          `[WARN] Cannot find mod translations info for mod ID ${modId} from database.`
        )
      );
      res.status(404).send({
        success: false,
        code: 404,
        message: "无法找到对应的 Mod 翻译信息",
      });
      return;
    }

    const { mod_name: name, mod_translation: translation } = modInfoQuery[0];

    console.log(
      chalk.cyan(`[INFO] Found mod name: ${name}, translation:  ${translation}`)
    );

    res.send({
      success: true,
      code: 200,
      message: "已查询到对应的 Mod 翻译信息",
      data: {
        mod_id: modId,
        mod_name: name,
        mod_translation: translation,
      },
    });
  } catch (error) {
    console.log(
      chalk.redBright(
        `[ERROR] Failed to fetch mod translations info from database.`
      ),
      error
    );
    res
      .status(500)
      .send({ success: false, code: 500, message: "Internal server error" });
  }
});
