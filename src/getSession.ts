import { CommandContext, Context } from 'grammy';
import puppeteer from 'puppeteer';
import { getToken } from './db';

export default async function getSession(ctx: CommandContext<Context>): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.goto('https://ecampus.kpi.ua/');
        if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
        const token = await getToken(ctx.from.id.toString());
        if (token)
            await page.setCookie(...[{ name: "token", value: token }]);
        await page.goto('https://ecampus.kpi.ua/home');
        const allResultsSelector = '.btn-primary';
        await page.waitForSelector(allResultsSelector);
        await page.click(allResultsSelector);
        await page.waitForSelector('.cntnt');
        await page.goto("https://campus.kpi.ua/student/index.php?mode=vedomoststud");
        const element = await page.$('.cntnt table');
        const value = await page.evaluate(el => el?.innerText, element);
        ctx.reply(value || '');
    } finally {
        await browser.close();
    }
}