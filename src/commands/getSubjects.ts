import { CommandContext, Context } from 'grammy';

import { getUser } from '../services/db';
import { getPage, getPHPSESSID, getUserId, parseSubjects } from '../utils';

export async function getSubjects(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        const user = await getUser(userId);
        const PHPSESSID = await getPHPSESSID(user);
        const page = await getPage("https://campus.kpi.ua/student/index.php?mode=studysheet", user.token, PHPSESSID);
        const inlineKeyboard = parseSubjects(page);
        await ctx.reply("Твої предмети у цьому семестрі:", { reply_markup: inlineKeyboard });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}
