import { HTMLElement } from 'node-html-parser';

export function parseAttestation(page: HTMLElement): string {
    const table = page.getElementById('StudyCourseData');
    const tableData = table.querySelectorAll('tbody td').map(td => td.text);

    const COLUMN_COUNT = 6;
    const rows = Array.from({ length: Math.ceil(tableData.length / COLUMN_COUNT) }, (_, i) =>
        tableData.slice(i * COLUMN_COUNT, (i + 1) * COLUMN_COUNT)
    );

    const semester = parseInt(process.env.DATASEM as string);
    const columnIndex = 2 + 2 * (semester - 1);

    const attestation = rows.filter(row => {
        const grade1 = row[columnIndex];
        const grade2 = row[columnIndex + 1];
        return (grade1 !== '' && grade1 !== 'н/в') || (grade2 !== '' && grade2 !== 'н/в');
    });

    if (attestation.length === 0)
        return 'Немає результатів календарного контролю';

    return "Результати календарного контролю:\n" + attestation.map(a => a[0] + '   <b>' + (a[columnIndex] || '❌') + "  " + (a[columnIndex + 1] || '❌') + '</b>').join("\n");
}
