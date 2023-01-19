import puppeteer from 'puppeteer';
import { ContextQuery } from '../interfaces';
import { authorization } from '../utils/authorization';

export async function getGrades(ctx: ContextQuery): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
        await authorization(ctx.from.id.toString(), page);
        await page.goto("https://campus.kpi.ua" + ctx.callbackQuery.data);
        const grades = await page.$$eval(`#tabs-0 table td`, e => e.map(td => td.textContent));
        const name = await page.$$eval(`.head td`, e => e.map(td => td.textContent)[3]);
        let answer = name?.substring(0, name.indexOf(',')) + ":\n";
        for (let i = 0; i < grades.length / 5; i++) {
            answer += grades[i * 5] + ' ' + (grades[i * 5 + 1] || '❌') + ' ' + grades[i * 5 + 2] + '\n';
        }
        const element = await page.$('#tabs-0 p');
        answer += await page.evaluate(el => el?.innerText, element);
        ctx.reply(answer);
    } finally {
        await browser.close();
    }
}