import { CommandContext, Context, InlineKeyboard } from 'grammy';
import puppeteer from 'puppeteer';
import { getToken } from './db';

export default async function GetSubjects(ctx: CommandContext<Context>): Promise<void> {
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
        await page.goto("https://campus.kpi.ua/student/index.php?mode=studysheet");
        const subjects = await page.evaluate(() => {
            const tds = [...document.querySelectorAll(`.ListBox tr[data-year="2022-2023"][data-sem="1"] td`)];
            return tds.map((td) => td.textContent);
        });
        const links = await page.evaluate(() => {
            const as = [...document.querySelectorAll(`.ListBox tr[data-year="2022-2023"][data-sem="1"] td a`)];
            return as.map((a) => a.getAttribute('href'));
        });
        const inlineKeyboard = new InlineKeyboard();
        for (let i = 0; i < links.length; i++) {
            inlineKeyboard.text(subjects[i * 2]?.substring(0, subjects[i * 2]?.indexOf(',')) || '', links[i] || '').row();
        }
        ctx.reply("Твої предмети у цьому семестрі:", { reply_markup: inlineKeyboard });
    } finally {
        await browser.close();
    }
}