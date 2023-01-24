import { CommandContext, Context } from "grammy";
import { deleteAllHash, updateDistribution } from "../services/db";

export async function unsubscribe(ctx: CommandContext<Context>): Promise<void> {
    try {
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        await updateDistribution(ctx.from.id.toString(), false);
        await deleteAllHash(ctx.from.id.toString());
        ctx.reply("Ви успішно відписалися");
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        ctx.reply(message);
    }
}