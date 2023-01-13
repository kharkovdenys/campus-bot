import { Bot, webhookCallback } from "grammy";
import express from "express";
import getSession from "./getSession";
import GetSubjects from "./getSubjects";
import getGrades from "./getGrades";

const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("🚧Бот у розробці🚧"));

bot.command("session", getSession);

bot.command("subjects", GetSubjects);

bot.callbackQuery(/student(.*)/, (ctx) => getGrades(ctx, ctx.callbackQuery.data))

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  bot.start();
}
