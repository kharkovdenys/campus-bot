import axios from "axios";
import iconv from 'iconv-lite';
import { HTMLElement, parse } from 'node-html-parser';

export async function getPage(url: string, token: string, PHPSESSID: string): Promise<HTMLElement> {
    return await axios(url, {
        responseType: "arraybuffer",
        headers: {
            'Cookie': `token=${token};PHPSESSID=${PHPSESSID};`
        }
    }).then((res) => parse(iconv.decode(res.data, 'win1251'))).catch(() => { throw new Error('Не вдалося відкрити сайт'); });
}