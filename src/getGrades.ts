import puppeteer from 'puppeteer';
import { getToken } from './db';

export default async function getGrades(ctx: { reply: (text: string) => void; from: { id: number } }, link: string): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.goto('https://ecampus.kpi.ua/');
        if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
        const token = await getToken(ctx.from.id.toString());
        if (token)
            await page.setCookie(...[{ name: "token", value: token }]);
        else { ctx.reply("Сталася якась помилка"); return; }
        await page.goto('https://ecampus.kpi.ua/home');
        const allResultsSelector = '.btn-primary';
        await page.waitForSelector(allResultsSelector);
        await page.click(allResultsSelector);
        await page.waitForSelector('.cntnt');
        await page.goto("https://campus.kpi.ua" + link);
        const grades = await page.evaluate(() => {
            const tds = [...document.querySelectorAll(`#tabs-0 table td`)];
            return tds.map((td) => td.textContent);
        });
        const name = await page.evaluate(() => {
            const tds = [...document.querySelectorAll(`.head td`)];
            return tds.map((td) => td.textContent)[3];
        });
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