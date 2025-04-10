import axios from "axios";
import { Router } from "express";
import "dotenv/config";
import chalk from "chalk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pkg from "pg";
import { Request, Response, NextFunction } from "express";

const { Pool } = pkg;

export const summaryRoute = Router();

const validateOrigin = (req: Request, res: Response, next: NextFunction) => {
  const referer = req.headers.referer || req.headers.origin;

  const allowedDomains = [
    /^http?:\/\/localhost:4859/,
    /^https?:\/\/.*\.lihaoyu\.cn$/,
    /^https?:\/\/.*\.cakemc\.top$/,
    /^https?:\/\/.*\.230225\.xyz$/,
  ];

  if (referer && allowedDomains.some((domain) => domain.test(referer))) {
    return next();
  }

  console.log(
    chalk.yellow(`[WARN] 未授权访问尝试，来源: ${referer || "未知"}`)
  );
  return res
    .status(403)
    .json({ error: "访问被拒绝，请确认您有权限使用此服务" });
};

summaryRoute.use(validateOrigin);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const pool = new Pool({
  connectionString: process.env.SUMMARY_DATABASE_URL,
});

async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blog_summaries (
        blog_id TEXT PRIMARY KEY,
        summary TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log(chalk.green("[INFO] Successfully init database"));
  } catch (error) {
    console.error(chalk.red("[ERROR] Failed to init database:"), error);
  }
}

initializeDatabase();

async function generateBlogSummary(blogContent: string): Promise<string> {
  try {
    console.log(chalk.yellow(`生成新的摘要`));

    const prompt = `
      请为以下博客文章生成一个简洁的摘要，控制在100-150字之间，
      突出文章的主要观点和价值。请使用第三人称，
      不要包含"本文"、"作者"等字眼，汉字与英文之间添加空格。
      
      文章内容:
      ${blogContent}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error(chalk.red("[ERROR] Failed to generate summary:"), error);
    throw new Error("摘要生成失败");
  }
}

summaryRoute.post("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content } = req.body;

    if (!blogId) {
      return res.status(400).json({ error: "Missing post slug." });
    }

    const existingResult = await pool.query(
      "SELECT summary FROM blog_summaries WHERE blog_id = $1",
      [blogId]
    );

    if (existingResult.rows.length > 0) {
      console.log(chalk.cyan(`[INFO] Use cached summary: ${blogId}`));
      return res.json({
        blogId,
        summary: existingResult.rows[0].summary,
        source: "database",
      });
    }

    if (!content) {
      return res.status(400).json({
        error: "未找到此博客的摘要，且未提供内容用于生成摘要",
      });
    }

    const summary = await generateBlogSummary(content);

    await pool.query(
      "INSERT INTO blog_summaries (blog_id, summary) VALUES ($1, $2) ON CONFLICT (blog_id) DO UPDATE SET summary = $2",
      [blogId, summary]
    );

    res.json({
      blogId,
      summary,
      source: "generated",
    });
  } catch (error) {
    console.error(chalk.red("[ERROR] Failed to execute summary:"), error);
    res.status(500).json({ error: "摘要操作失败" });
  }
});

summaryRoute.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;

    const result = await pool.query(
      "SELECT summary FROM blog_summaries WHERE blog_id = $1",
      [blogId]
    );

    if (result.rows.length > 0) {
      res.json({ blogId, summary: result.rows[0].summary });
    } else {
      res.status(404).json({ error: "未找到此博客的摘要" });
    }
  } catch (error) {
    console.error(chalk.red("[ERROR] Failed to get summary:"), error);
    res.status(500).json({ error: "获取摘要失败" });
  }
});
