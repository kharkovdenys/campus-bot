import { CommandContext, Context, InlineKeyboard } from 'grammy';
import { getUser } from '../services/db';
import { getPage, getPHPSESSID } from '../utils';

export async function GetSubjects(ctx: CommandContext<Context>): Promise<void> {
    try {
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        const user = await getUser(ctx.from.id.toString());
        const PHPSESSID = await getPHPSESSID(user);
        const data = await getPage("https://campus.kpi.ua/student/index.php?mode=studysheet", user.token, PHPSESSID);
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td`;
        const subjects = data.querySelectorAll(selector).map(subject => subject.text);
        const links = data.querySelectorAll(selector + " a").map(link => link.getAttribute('href'));
        const inlineKeyboard = new InlineKeyboard();
        for (let i = 0; i < links.length; i++) {
            inlineKeyboard.text(subjects[i * 2]?.substring(0, subjects[i * 2]?.indexOf(',')) || '', links[i] || '').row();
        }
        ctx.reply("Твої предмети у цьому семестрі:", { reply_markup: inlineKeyboard });
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        ctx.reply(message);
    }
}