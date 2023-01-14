import { Api, RawApi } from "grammy";
import puppeteer from "puppeteer";
import { insertHash, updateHash } from "./db";
import hash from "./hash";

export default async function checkHesh(user: { userId: string; token: string }, hashes: { subjectId: string, hash256: string }[], bot?: Api<RawApi>): Promise<void> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    try {
        const update = [];
        const insert = [];
        const page = await browser.newPage();
        await page.goto('https://ecampus.kpi.ua/');
        if (user.token)
            await page.setCookie(...[{ name: "token", value: user.token }]);
        else { console.log("Сталася якась помилка"); return; }
        await page.goto('https://ecampus.kpi.ua/home');
        const allResultsSelector = '.btn-primary';
        await page.waitForSelector(allResultsSelector);
        await page.click(allResultsSelector);
        await page.waitForSelector('.cntnt');
        await page.goto("https://campus.kpi.ua/student/index.php?mode=vedomoststud");
        const element = await page.$('.cntnt table');
        const value = await page.evaluate(el => el?.innerText, element);
        const hash256 = hash(value || '');
        const current = hashes.filter((h) => h.subjectId === '-1');
        if (current.length) {
            if (current[0].hash256 !== hash256) {
                update.push({ subjectId: '-1', hash256 });
                await bot?.sendMessage(user.userId, value || '');
            }
        } else {
            insert.push({ subjectId: '-1', hash256 });
            await bot?.sendMessage(user.userId, value || '');
        }
        await page.goto("https://campus.kpi.ua/student/index.php?mode=studysheet");
        const links = await page.evaluate(() => {
            const as = [...document.querySelectorAll(`.ListBox tr[data-year="2022-2023"][data-sem="1"] td a`)];
            return as.map((a) => a.getAttribute('href'));
        });
        for (const link of links) {
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
            const hash256 = hash(answer);
            const subjectId = link?.match(/id=([0-9]*)/)?.[1];
            if (subjectId) {
                const current = hashes.filter((h) => h.subjectId === subjectId);
                if (current.length) {
                    if (current[0].hash256 !== hash256) {
                        update.push({ subjectId, hash256 });
                        await bot?.sendMessage(user.userId, answer);
                    }
                } else {
                    insert.push({ subjectId, hash256 });
                    await bot?.sendMessage(user.userId, answer);
                }
            }

        }
        if (update.length) {
            await updateHash(user.userId, update);
        }
        if (insert.length) {
            await insertHash(user.userId, insert);
        }
    }
    finally {
        await browser.close();
    }
}