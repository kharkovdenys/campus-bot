import express from 'express';
import { Bot, webhookCallback } from 'grammy';
import helmet from 'helmet';

import {
  getAttestation, getGrades, getSession, getSubjects, login, logout, start, subscribe, unsubscribe
} from './commands';
import { check, sendRequests } from './services/schedule';

const botToken = process.env.TELEGRAM_TOKEN;
if (!botToken) {
  throw new Error("Telegram token not provided.");
}

const bot = new Bot(botToken);

bot.command("start", start);

bot.command("session", getSession);

bot.command("subjects", getSubjects);

bot.command("attestation", getAttestation);

bot.command("login", login);

bot.command("logout", logout);

bot.command("subscribe", subscribe);

bot.command("unsubscribe", unsubscribe);

bot.callbackQuery(/student(.*)/, getGrades);

if (process.env.NODE_ENV === "development") {
  bot.start();
}
else {
  const app = express();

  app.use(express.json());
  app.use(helmet());

  app.get("/schedule", async (req, res) => {
    if (req.get("cron") === process.env.CRON_CODE) {
      await sendRequests();
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  });

  app.post("/check", async (req, res) => {
    if (req.get("cron") === process.env.CRON_CODE) {
      await check(bot.api, req.body);
      res.sendStatus(200);
    } else {
      res.sendStatus(403);
    }
  });

  app.use(
    webhookCallback(bot, "express", {
      onTimeout: () => console.log("timeout"),
      timeoutMilliseconds: 30000,
    })
  );

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
}
