import { CommandContext, Context } from "grammy";
import { deleteAllHash, getUser, updateDistribution } from "../services/db";
import { checkHesh } from "./checkHesh";

export async function subscribe(ctx: CommandContext<Context>): Promise<void> {
    try {
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        await updateDistribution(ctx.from.id.toString(), true);
        await deleteAllHash(ctx.from.id.toString());
        const user = await getUser(ctx.from.id.toString());
        await checkHesh(user, []);
        await ctx.reply("Ви успішно підписалися");
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        await ctx.reply(message);
    }
}