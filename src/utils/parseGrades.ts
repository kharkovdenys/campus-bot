import { HTMLElement } from 'node-html-parser';

export function parseGrades(page: HTMLElement): string {
    const grades = page.querySelectorAll(`#tabs-0 table td`).map(grade => grade.text);
    const subjectInfoElement = page.querySelectorAll('.head td')[3];
    const subjectInfo = subjectInfoElement?.text || '';
    const subjectName = subjectInfo.substring(0, subjectInfo.indexOf(','));

    let formattedGrades = subjectName + ":\n";

    for (let i = 0; i < grades.length / 5; i++) {
        const [date, grade, type, ,] = grades.slice(i * 5, i * 5 + 5);
        formattedGrades += `${date} ${grade || '❌'} ${type}\n`;
    }

    const paragraph = page.querySelector('#tabs-0 p');
    if (paragraph) {
        const overallResult = paragraph.text.trim();
        formattedGrades += `${overallResult}`;
    }

    return formattedGrades;
}
