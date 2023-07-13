import { InlineKeyboard } from 'grammy';
import { HTMLElement } from 'node-html-parser';

export function parseSubjects(page: HTMLElement): InlineKeyboard {
    const selector = `.ListBox tr[data-year="${process.env.DATAYEAR}"][data-sem="${process.env.DATASEM}"] td`;
    const subjects = page.querySelectorAll(selector).map(subject => subject.text);
    const links = page.querySelectorAll(selector + " a").map(link => link.getAttribute('href'));

    const inlineKeyboard = new InlineKeyboard();
    subjects.forEach((subject, index) => {
        if (index % 2 === 0) {
            const [subjectName] = subject.split(',');
            const link = links[index / 2] || '';
            inlineKeyboard.text(subjectName || '', link).row();
        }
    });

    return inlineKeyboard;
}