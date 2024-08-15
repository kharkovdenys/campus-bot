import iconv from 'iconv-lite';
import { HTMLElement, parse } from 'node-html-parser';

export async function getPage(url: string, token: string, PHPSESSID: string): Promise<HTMLElement> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Cookie': `token=${token};PHPSESSID=${PHPSESSID};`
            }
        });

        if (!response.ok) {
            throw new Error('Не вдалося відкрити сайт');
        }

        const buffer = await response.arrayBuffer();
        const decodedData = iconv.decode(Buffer.from(buffer), 'win1251');
        return parse(decodedData);
    } catch (error) {
        throw error;
    }
}
