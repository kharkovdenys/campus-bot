import { CommandContext, Context } from 'grammy';
import { getUser } from '../services/db';
import { getPHPSESSID, getPage, getUserId } from '../utils';

export async function getSession(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        const user = await getUser(userId);
        const PHPSESSID = await getPHPSESSID(user);
        const data = await getPage("https://campus.kpi.ua/student/index.php?mode=vedomoststud", user.token, PHPSESSID);
        await ctx.reply(data.querySelector('.cntnt table')?.structuredText || 'Відомість пуста');
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}