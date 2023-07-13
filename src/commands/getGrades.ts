import { CallbackQueryContext, Context } from 'grammy';
import { getUser } from '../services/db';
import { getPHPSESSID, getPage, getUserId, parseGrades } from '../utils';

export async function getGrades(ctx: CallbackQueryContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        const user = await getUser(userId);
        const PHPSESSID = await getPHPSESSID(user);
        const page = await getPage("https://campus.kpi.ua" + ctx.callbackQuery.data, user.token, PHPSESSID);
        const grades = parseGrades(page);
        await ctx.reply(grades);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}