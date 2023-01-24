import { CommandContext, Context } from 'grammy';
import { getUser } from '../services/db';
import { getPHPSESSID, getPage } from '../utils';

export async function getSession(ctx: CommandContext<Context>): Promise<void> {
    try {
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        const user = await getUser(ctx.from.id.toString());
        const PHPSESSID = await getPHPSESSID(user);
        const data = await getPage("https://campus.kpi.ua/student/index.php?mode=vedomoststud", user.token, PHPSESSID);
        await ctx.reply(data.querySelector('.cntnt table')?.structuredText || '');
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        await ctx.reply(message);
    }
}