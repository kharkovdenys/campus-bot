import { Page } from "puppeteer";
import { getToken } from "../services/db";

export async function authorization(userId: string, page: Page): Promise<void> {
    await page.goto('https://ecampus.kpi.ua/');
    const token = await getToken(userId);
    if (token)
        await page.setCookie(...[{ name: "token", value: token }]);
    else throw new Error();
    await page.goto('https://ecampus.kpi.ua/home');
    const allResultsSelector = '.btn-primary';
    await page.waitForSelector(allResultsSelector);
    await page.click(allResultsSelector);
    await page.waitForSelector('.cntnt');
}