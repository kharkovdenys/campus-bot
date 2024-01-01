import { CallbackQueryContext, CommandContext, Context } from 'grammy';

export function getUserId(ctx: CommandContext<Context> | CallbackQueryContext<Context>): string {
    if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
    return ctx.from.id.toString();
}
