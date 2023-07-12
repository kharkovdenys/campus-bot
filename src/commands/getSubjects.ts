import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { getUser } from '../services/db';
import { getPHPSESSID, getPage, getUserId } from '../utils';

export async function getSubjects(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        const user = await getUser(userId);
        const PHPSESSID = await getPHPSESSID(user);
        const data = await getPage("https://campus.kpi.ua/student/index.php?mode=studysheet", user.token, PHPSESSID);
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td`;
        const subjects = data.querySelectorAll(selector).map(subject => subject.text);
        const links = data.querySelectorAll(selector + " a").map(link => link.getAttribute('href'));
        const inlineKeyboard = new InlineKeyboard();
        for (let i = 0; i < links.length; i++) {
            inlineKeyboard.text(subjects[i * 2]?.substring(0, subjects[i * 2]?.indexOf(',')) || '', links[i] || '').row();
        }
        await ctx.reply("Твої предмети у цьому семестрі:", { reply_markup: inlineKeyboard });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}