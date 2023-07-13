import { Api, RawApi } from "grammy";
import { Hash, User } from "../interfaces";
import { updateHash } from "../services/db";
import { getPHPSESSID, getPage, parseAttestation, parseGrades, parseSession, sha256 } from "../utils";

export async function checkHesh(user: User, hashes: Hash[], bot?: Api<RawApi>): Promise<void> {
    try {
        const update: Hash[] = [];
        const PHPSESSID = await getPHPSESSID(user);

        let page = await getPage("https://campus.kpi.ua/student/index.php?mode=vedomoststud", user.token, PHPSESSID);
        const session = parseSession(page);
        let hash256 = sha256(session);
        let current = hashes.find((h) => h.subjectId === '-1');
        if (!current || (current && current.hash256 !== hash256)) {
            update.push({ subjectId: '-1', hash256 });
            await bot?.sendMessage(user.userId, session);
        }

        page = await getPage("https://campus.kpi.ua/student/index.php?mode=attestationresults", user.token, PHPSESSID);
        const attestation = parseAttestation(page);
        hash256 = sha256(attestation);
        current = hashes.find((h) => h.subjectId === '-2');
        if (!current || (current && current.hash256 !== hash256)) {
            update.push({ subjectId: '-2', hash256 });
            await bot?.sendMessage(user.userId, attestation);
        }

        page = await getPage("https://campus.kpi.ua/student/index.php?mode=studysheet", user.token, PHPSESSID);
        const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td a`;
        const links = page.querySelectorAll(selector).map(link => link.getAttribute('href'));

        for (const link of links) {
            page = await getPage("https://campus.kpi.ua" + link, user.token, PHPSESSID);
            const grades = parseGrades(page);
            const hash256 = sha256(grades);
            const subjectId = link?.match(/id=([0-9]*)/)?.[1];
            current = hashes.find((h) => h.subjectId === subjectId);
            if (subjectId && (!current || (current && current.hash256 !== hash256))) {
                update.push({ subjectId, hash256 });
                await bot?.sendMessage(user.userId, grades);
            }
        }

        if (update.length) await updateHash(user.userId, update);
    } catch {
        throw new Error('Не вдалося перевірити хеш');
    }
}