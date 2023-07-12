import { CommandContext, Context } from "grammy";

export async function start(ctx: CommandContext<Context>): Promise<void> {
    const firstName = ctx.from?.first_name || "unknown";
    ctx.reply(`Привіт, ${firstName}!\n
Цей бот переглядає та стежить за оновленням оцінок на сайті campus.kpi.ua\n
Для початку треба зайти до акаунту, для цього треба ввести команду /login [Username] [Password]`);
}