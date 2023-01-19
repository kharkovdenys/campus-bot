import { Api, RawApi } from "grammy";
import puppeteer from "puppeteer";
import { minimal_args } from "../config/puppeteer";
import { Hash, User } from "../interfaces";
import { insertHash, updateHash } from "../services/db";
import { authorization } from "../utils/authorization";
import sha256 from "../utils/sha256";

export async function checkHesh(user: User, hashes: Hash[], bot?: Api<RawApi>): Promise<void> {
    const browser = await puppeteer.launch({ args: minimal_args });
    try {
        const update: Hash[] = [], insert: Hash[] = [];
        const page = await browser.newPage();
        await authorization(user.userId, page);
        await page.goto("https://campus.kpi.ua/student/index.php?mode=vedomoststud");
        const element = await page.$('.cntnt table');
        const value = await page.evaluate(el => el?.innerText, element);
        const hash256 = sha256(value || '');
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
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td a`;
        const links = await page.$$eval(selector, e => e.map(a => a.getAttribute('href')));
        for (const link of links) {
            await page.goto("https://campus.kpi.ua" + link);
            const grades = await page.$$eval(`#tabs-0 table td`, e => e.map(td => td.textContent));
            const name = await page.$$eval(`.head td`, e => e.map(td => td.textContent)[3]);
            let answer = name?.substring(0, name.indexOf(',')) + ":\n";
            for (let i = 0; i < grades.length / 5; i++) {
                answer += grades[i * 5] + ' ' + (grades[i * 5 + 1] || '❌') + ' ' + grades[i * 5 + 2] + '\n';
            }
            const element = await page.$('#tabs-0 p');
            answer += await page.evaluate(el => el?.innerText, element);
            const hash256 = sha256(answer);
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
        if (update.length) await updateHash(user.userId, update);
        if (insert.length) await insertHash(user.userId, insert);
    }
    finally {
        await browser.close();
    }
}