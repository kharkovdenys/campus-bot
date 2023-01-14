import { CommandContext, Context } from "grammy";
import { addToken, deleteToken } from "./db";

export default async function login(ctx: CommandContext<Context>): Promise<void> {
    try {
        const arg = ctx.match.trim().split(' ');
        try {
            await ctx.deleteMessage();
        } catch {
            console.log("Помилка видалення повідомлення");
        }
        if (!ctx.from || arg.length !== 2) { ctx.reply("Сталася якась помилка"); return; }
        await deleteToken(ctx.from.id.toString());
        const details: { [key: string]: string } = {
            'username': arg[0],
            'password': arg[1],
            'grant_type': 'password'
        };
        const formBody = [];
        for (const property in details) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        const data = await fetch("https://api.campus.kpi.ua/oauth/token", {
            method: 'POST', headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            body: formBody.join("&")
        });
        const token = data.headers.get('set-cookie')?.match(/token=([^;]*);/)?.[1];
        if (!token) { ctx.reply("Токен повернувся пустим"); return; }
        const added = await addToken(ctx.from.id.toString(), token);
        if (!added) { ctx.reply("Сталась помилка при додаванні"); return; }
        ctx.reply("Автентифікація пройшла успішно");
    } catch (e) {
        ctx.reply("Сталася якась помилка");
    }
}