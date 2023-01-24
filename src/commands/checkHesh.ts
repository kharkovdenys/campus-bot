import { Api, RawApi } from "grammy";
import { Hash, User } from "../interfaces";
import { insertHash, updateHash } from "../services/db";
import { getPage, getPHPSESSID, sha256 } from "../utils";

export async function checkHesh(user: User, hashes: Hash[], bot?: Api<RawApi>): Promise<void> {
    try {
        const update: Hash[] = [], insert: Hash[] = [];
        const PHPSESSID = await getPHPSESSID(user);
        let data = await getPage("https://campus.kpi.ua/student/index.php?mode=vedomoststud", user.token, PHPSESSID);
        const value = data.querySelector('.cntnt table')?.structuredText || '';
        const hash256 = sha256(value);
        const current = hashes.filter((h) => h.subjectId === '-1');
        if (current.length) {
            if (current[0].hash256 !== hash256) {
                update.push({ subjectId: '-1', hash256 });
                await bot?.sendMessage(user.userId, value);
            }
        } else {
            insert.push({ subjectId: '-1', hash256 });
            await bot?.sendMessage(user.userId, value);
        }
        data = await getPage("https://campus.kpi.ua/student/index.php?mode=studysheet", user.token, PHPSESSID);
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td a`;
        const links = data.querySelectorAll(selector).map(link => link.getAttribute('href'));
        for (const link of links) {
            data = await getPage("https://campus.kpi.ua" + link, user.token, PHPSESSID);
            const grades = data.querySelectorAll(`#tabs-0 table td`).map(grade => grade.text);
            const name = data.querySelectorAll(`.head td`)[3].text;
            let answer = name?.substring(0, name.indexOf(',')) + ":\n";
            for (let i = 0; i < grades.length / 5; i++) {
                answer += grades[i * 5] + ' ' + (grades[i * 5 + 1] || '❌') + ' ' + grades[i * 5 + 2] + '\n';
            }
            answer += data.querySelector('#tabs-0 p')?.text;
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
    } catch {
        throw new Error('Не вдалося перевірити хеш');
    }
}