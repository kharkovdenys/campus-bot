import { CommandContext, Context } from "grammy";
import { deleteAllHash, getUser, updateDistribution } from "../services/db";
import { getUserId } from "../utils";
import { checkHesh } from "./checkHesh";

export async function subscribe(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        const fetchedUser = await getUser(userId);
        if (!fetchedUser) throw new Error("Не вдалося отримати дані користувача");
        await updateDistribution(userId, true);
        await deleteAllHash(userId);
        await checkHesh(fetchedUser, []);
        await ctx.reply("Ви успішно підписалися");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}