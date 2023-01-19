import { CommandContext, Context } from 'grammy';
import puppeteer from 'puppeteer';
import { minimal_args } from '../config/puppeteer';
import { authorization } from '../utils/authorization';

export async function getSession(ctx: CommandContext<Context>): Promise<void> {
    const browser = await puppeteer.launch({ args: minimal_args });
    try {
        const page = await browser.newPage();
        await page.goto('https://ecampus.kpi.ua/');
        if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
        await authorization(ctx.from.id.toString(), page);
        await page.goto("https://campus.kpi.ua/student/index.php?mode=vedomoststud");
        const element = await page.$('.cntnt table');
        const value = await page.evaluate(el => el?.innerText, element);
        ctx.reply(value || '');
    } finally {
        await browser.close();
    }
}