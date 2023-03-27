import { Bot, webhookCallback } from "grammy";
import express from "express";
import { getGrades, getSession, GetSubjects, login, logout, subscribe, unsubscribe } from "./commands";
import { check, sendRequests } from "./services/schedule";

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

if (process.env.NODE_ENV === "production") {
  const app = express();
  app.use(express.json());
  app.get('/schedule', async (req, res) => {
    if (req.get("cron") === process.env.CRON_CODE) {
      await sendRequests();
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  });
  app.post('/check', async (req, res) => {
    if (req.get("cron") === process.env.CRON_CODE) {
      await check(bot.api, req.body);
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  });
  app.use(webhookCallback(bot, "express", { onTimeout: () => console.log("timeout"), timeoutMilliseconds: 45000 }));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  bot.start();
}