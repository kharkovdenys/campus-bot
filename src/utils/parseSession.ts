import { HTMLElement } from 'node-html-parser';

export function parseSession(page: HTMLElement): string {
    const table = page.querySelector('.cntnt table');

    if (!table) return 'Немає результатів сесії';
    const result: string[][] = [];

    table.querySelectorAll('tr').forEach((row) => {
        const rowResult: string[] = [];

        row.querySelectorAll('td, th').forEach((cell) => {
            const cellText = cell.text.trim();
            const cellValue = cellText === '' ? '' : cellText;

            rowResult.push(cellValue);
        });

        result.push(rowResult);
    });
    if (!result.length) return 'Немає сесії';
    const header = result.shift();
    if (!header) return 'Немає заголовку таблиці';
    if (!result.length) return 'Немає результатів сесії';
    const lastDate = new Date(result[0][1]).getTime();
    const lastSession = result.filter(row => Math.ceil(Math.abs(lastDate - new Date(row[1]).getTime()) / (1000 * 60 * 60 * 24)) < 80);

    return header.join(' ') + '\n' + lastSession.map(e => {
        if (e[5] === '')
            e[5] = 'Не визначено';
        if (e[6] === '')
            e[6] = 'Не виставлено';
        return e.join(', ');
    }).join('\n');
}
