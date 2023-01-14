import { Bot, GrammyError, HttpError, webhookCallback } from "grammy";
import express from "express";
import schedule from "node-schedule";
import getSession from "./getSession";
import GetSubjects from "./getSubjects";
import getGrades from "./getGrades";
import startdb, { deleteAllHash, deleteToken, getDistribution, getHash, getToken, updateDistribution } from "./db";
import login from "./login";
import checkHesh from "./checkHesh";

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

bot.command("subscribe", async (ctx) => {
  if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
  if (await updateDistribution(ctx.from.id.toString(), true)) {
    await deleteAllHash(ctx.from.id.toString());
    const token = await getToken(ctx.from.id.toString());
    if (!token) { ctx.reply("Ви не пройшли автентифікацію"); return; }
    await checkHesh({ userId: ctx.from.id.toString(), token }, []);
    ctx.reply("Ви успішно підписалися");
  }
  else
    ctx.reply("Сталася якась помилка");
});

bot.command("unsubscribe", async (ctx) => {
  if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
  if (await updateDistribution(ctx.from.id.toString(), false))
    ctx.reply("Ви успішно відписалися");
  else
    ctx.reply("Сталася якась помилка");
});

bot.callbackQuery(/student(.*)/, (ctx) => getGrades(ctx, ctx.callbackQuery.data));

schedule.scheduleJob('59 * * * *', async function () {
  console.log('check');
  const users = await getDistribution();
  if (!users) { console.log("Сталася якась помилка"); return; }
  for (let i = 0; i < users.length; i++) {
    const hashes = await getHash(users[i].userId);
    if (hashes)
      await checkHesh(users[i], hashes, bot.api);
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

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
