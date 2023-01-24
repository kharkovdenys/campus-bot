import { User } from "../interfaces";
import fetch from "node-fetch";

export async function getPHPSESSID(user: User): Promise<string> {
    if (!user) throw new Error('Ви не автентифіковані');
    const PHPSESSID = await fetch("https://campus.kpi.ua/auth.php", {
        redirect: "manual",
        headers: {
            'Cookie': `token=${user.token};SID=${user.SID};`
        }
    }).then(res => res.headers.get('set-cookie')?.substring(56, 82)).catch(() => { throw new Error('Не вдалося отримати ідентифікатор сеансу'); });
    if (!PHPSESSID) throw new Error('Не вдалося отримати ідентифікатор сеансу');
    return PHPSESSID;
}