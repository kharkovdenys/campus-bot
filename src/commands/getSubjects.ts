import { CommandContext, Context, InlineKeyboard } from 'grammy';
import puppeteer from 'puppeteer';
import { authorization } from '../utils/authorization';

export async function GetSubjects(ctx: CommandContext<Context>): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const page = await browser.newPage();
        await page.goto('https://ecampus.kpi.ua/');
        if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
        await authorization(ctx.from.id.toString(), page);
        await page.goto("https://campus.kpi.ua/student/index.php?mode=studysheet");
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td`;
        const subjects = await page.$$eval(selector, e => e.map(subject => subject.textContent));
        const links = await page.$$eval(selector + " a", e => e.map(a => a.getAttribute('href')));
        const inlineKeyboard = new InlineKeyboard();
        for (let i = 0; i < links.length; i++) {
            inlineKeyboard.text(subjects[i * 2]?.substring(0, subjects[i * 2]?.indexOf(',')) || '', links[i] || '').row();
        }
        ctx.reply("Твої предмети у цьому семестрі:", { reply_markup: inlineKeyboard });
    } finally {
        await browser.close();
    }
}