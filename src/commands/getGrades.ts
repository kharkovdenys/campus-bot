import { CallbackQueryContext, Context } from 'grammy';
import { getUser } from '../services/db';
import { getPHPSESSID, getPage } from '../utils';

export async function getGrades(ctx: CallbackQueryContext<Context>): Promise<void> {
    try {
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        const user = await getUser(ctx.from.id.toString());
        const PHPSESSID = await getPHPSESSID(user);
        const data = await getPage("https://campus.kpi.ua" + ctx.callbackQuery.data, user.token, PHPSESSID);
        const grades = data.querySelectorAll(`#tabs-0 table td`).map(grade => grade.text);
        const name = data.querySelectorAll(`.head td`)[3].text;
        let answer = name?.substring(0, name.indexOf(',')) + ":\n";
        for (let i = 0; i < grades.length / 5; i++) {
            answer += grades[i * 5] + ' ' + (grades[i * 5 + 1] || '❌') + ' ' + grades[i * 5 + 2] + '\n';
        }
        answer += data.querySelector('#tabs-0 p')?.text;
        ctx.reply(answer);
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        ctx.reply(message);
    }
}