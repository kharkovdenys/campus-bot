import { CommandContext, Context } from "grammy";
import { deleteAllHash, deleteUser } from "../services/db";

export async function logout(ctx: CommandContext<Context>): Promise<void> {
    try {
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        await deleteAllHash(ctx.from.id.toString());
        await deleteUser(ctx.from.id.toString());
        ctx.reply("Вихід відбувся успішно");
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        ctx.reply(message);
    }
}