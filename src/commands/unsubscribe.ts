import { CommandContext, Context } from "grammy";
import { deleteAllHash, updateDistribution } from "../services/db";
import { getUserId } from "../utils";

export async function unsubscribe(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        await updateDistribution(userId, false);
        await deleteAllHash(userId);
        await ctx.reply("Ви успішно відписалися");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}