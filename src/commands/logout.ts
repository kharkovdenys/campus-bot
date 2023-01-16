import { CommandContext, Context } from "grammy";
import { deleteToken } from "../services/db";

export async function logout(ctx: CommandContext<Context>): Promise<void> {
    if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
    if (await deleteToken(ctx.from.id.toString()))
        ctx.reply("Вихід відбувся успішно");
    else
        ctx.reply("Сталася якась помилка");
}