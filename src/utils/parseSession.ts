import { HTMLElement } from 'node-html-parser';

export function parseSession(page: HTMLElement): string {
    const tableText = page.querySelector('.cntnt table')?.structuredText;

    if (!tableText) return 'Немає результатів сесії';

    const tableArray = tableText.split('\n');
    const header = tableArray.splice(0, 1);

    const COLUMN_COUNT = 8;
    const rows = Array.from({ length: Math.ceil(tableArray.length / COLUMN_COUNT) }, (_, i) =>
        tableArray.slice(i * COLUMN_COUNT, (i + 1) * COLUMN_COUNT)
    );

    if (!rows.length) return 'Немає результатів сесії';
    const lastDate = new Date(rows[0][1]).getTime();
    const lastSession = rows.filter(row => Math.ceil(Math.abs(lastDate - new Date(row[1]).getTime()) / (1000 * 60 * 60 * 24)) < 80);

    return header + '\n' + lastSession.join('\n');
}