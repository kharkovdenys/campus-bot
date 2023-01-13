import { Builder, Browser, By, until } from 'selenium-webdriver';

export default async function getSession(ctx: any) {
    let driver = await new Builder().forBrowser(Browser.CHROME).build();
    try {
        await driver.get('https://ecampus.kpi.ua/');
        if (process.env.TOKEN)
            await driver.manage().addCookie({ name: "token", value: process.env.TOKEN })
        await driver.navigate().to('https://ecampus.kpi.ua/home');
        await driver.findElement(By.css(".btn-primary")).click();
        await driver.wait(until.urlContains('/campus'), 500);
        await driver.navigate().to("https://campus.kpi.ua/student/index.php?mode=vedomoststud");
        ctx.reply(await driver.findElement(By.css("table")).getText());
    } finally {
        await driver.quit();
    }
}