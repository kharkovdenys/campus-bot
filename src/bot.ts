import { Bot, webhookCallback } from "grammy";
import express from "express";
import schedule from "node-schedule";
import startdb from "./services/db";
import { getGrades, getSession, GetSubjects, login, logout, subscribe, unsubscribe } from "./commands";
import check from "./services/schedule";

const bot = new Bot(process.env.TELEGRAM_TOKEN || "");

bot.command("start", (ctx) => ctx.reply(`Привіт, ${ctx.from?.first_name}!\n
Цей бот переглядає та стежить за оновленням оцінок на сайті campus.kpi.ua\n
Для початку треба зайти до акаунту, для цього треба ввести команду /login [Username] [Password]`));

bot.command("session", getSession);

bot.command("subjects", GetSubjects);

bot.command("login", login);

bot.command("logout", logout);

bot.command("subscribe", subscribe);

bot.command("unsubscribe", unsubscribe);

bot.callbackQuery(/student(.*)/, getGrades);

schedule.scheduleJob('59 * * * *', () => check(bot.api));

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express", { onTimeout: () => console.log("timeout"), timeoutMilliseconds: 45000 }));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, async () => {
    await startdb();
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  startdb().then(() => bot.start());
}