import { Bot, webhookCallback } from "grammy";
import express from "express";
import getSession from "./getSession";
import GetSubjects from "./getSubjects";
import getGrades from "./getGrades";
import startdb, { deleteToken } from "./db";
import login from "./login";

const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

bot.command("start", (ctx) => ctx.reply("🚧Бот у розробці🚧"));

bot.command("session", getSession);

bot.command("subjects", GetSubjects);

bot.command("login", login);

bot.command("logout", async (ctx) => {
  if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
  if (await deleteToken(ctx.from.id.toString()))
    ctx.reply("Вихід відбувся успішно");
  else
    ctx.reply("Сталася якась помилка");
});

bot.callbackQuery(/student(.*)/, (ctx) => getGrades(ctx, ctx.callbackQuery.data));

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    await startdb();
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  startdb().then(() => bot.start());
}
