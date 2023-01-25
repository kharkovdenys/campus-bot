import { User } from "../interfaces";
import axios from "axios";

export async function getPHPSESSID(user: User): Promise<string> {
    if (!user) throw new Error('Ви не автентифіковані');
    const PHPSESSID = await axios("https://campus.kpi.ua/auth.php", {
        maxRedirects: 0,
        validateStatus: function (status) {
            return status >= 200 && status < 303;
        },
        headers: {
            'Cookie': `token=${user.token};SID=${user.SID};`
        }
    }).then(res => res.headers["set-cookie"]?.[1].substring(10, 36)).catch(() => { throw new Error('Не вдалося отримати ідентифікатор сеансу'); });
    if (!PHPSESSID) throw new Error('Не вдалося отримати ідентифікатор сеансу');
    return PHPSESSID;
}