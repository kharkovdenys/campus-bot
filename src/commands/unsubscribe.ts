import { CommandContext, Context } from "grammy";
import { updateDistribution } from "../services/db";

export async function unsubscribe(ctx: CommandContext<Context>): Promise<void> {
    if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
    if (await updateDistribution(ctx.from.id.toString(), false))
        ctx.reply("Ви успішно відписалися");
    else
        ctx.reply("Сталася якась помилка");
}