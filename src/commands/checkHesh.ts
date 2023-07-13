import { Api, RawApi } from "grammy";
import { Hash, User } from "../interfaces";
import { updateHash } from "../services/db";
import { getPHPSESSID, getPage, parseGrades, sha256 } from "../utils";

export async function checkHesh(user: User, hashes: Hash[], bot?: Api<RawApi>): Promise<void> {
    try {
        const update: Hash[] = [];
        const PHPSESSID = await getPHPSESSID(user);
        let page = await getPage("https://campus.kpi.ua/student/index.php?mode=vedomoststud", user.token, PHPSESSID);
        const value = page.querySelector('.cntnt table')?.structuredText || '';
        const hash256 = sha256(value);
        const current = hashes.filter((h) => h.subjectId === '-1');
        if (!current.length || current[0].hash256 !== hash256) {
            update.push({ subjectId: '-1', hash256 });
            if (value !== '') await bot?.sendMessage(user.userId, value);
        }
        page = await getPage("https://campus.kpi.ua/student/index.php?mode=studysheet", user.token, PHPSESSID);
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td a`;
        const links = page.querySelectorAll(selector).map(link => link.getAttribute('href'));
        for (const link of links) {
            page = await getPage("https://campus.kpi.ua" + link, user.token, PHPSESSID);
            const grades = parseGrades(page);
            const hash256 = sha256(grades);
            const subjectId = link?.match(/id=([0-9]*)/)?.[1];
            if (subjectId) {
                const current = hashes.filter((h) => h.subjectId === subjectId);
                if (!current.length || current[0].hash256 !== hash256) {
                    update.push({ subjectId, hash256 });
                    if (value !== '') await bot?.sendMessage(user.userId, grades);
                }
            }
        }
        if (update.length) await updateHash(user.userId, update);
    } catch {
        throw new Error('Не вдалося перевірити хеш');
    }
}