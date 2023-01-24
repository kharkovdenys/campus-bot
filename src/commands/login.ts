import { CommandContext, Context } from "grammy";
import { addUser, deleteUser } from "../services/db";
import axios from 'axios';

export async function login(ctx: CommandContext<Context>): Promise<void> {
    try {
        const arg = ctx.match.trim().split(' ');
        await ctx.deleteMessage();
        if (!ctx.from) throw new Error("Не вдалося отримати ваш ідентифікатор із Telegram");
        if (arg.length !== 2) throw new Error("Неправильний формат запису");
        await deleteUser(ctx.from.id.toString());
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
        const data = await axios("https://api.campus.kpi.ua/oauth/token", {
            method: 'POST', headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
            },
            data: formBody.join("&")
        }).catch(e => {
            if (axios.isAxiosError(e)) {
                if (e.response?.status === 403)
                    throw new Error('Введено неправильні дані');
                else
                    throw new Error('Сайт не відповідає');
            } else {
                throw new Error('Під час надсилання запиту сталася помилка');
            }
        });
        const SID = data.headers['set-cookie']?.[0]?.match(/SID=([^;]*);/)?.[1];
        const token = data.headers['set-cookie']?.[1]?.match(/token=([^;]*);/)?.[1];
        if (!token || !SID) throw new Error('Сайт повертає порожні дані');
        await addUser(ctx.from.id.toString(), token, SID);
        await ctx.reply("Автентифікація пройшла успішно");
    } catch (e) {
        let message = 'Сталася невідома помилка';
        if (e instanceof Error) message = e.message;
        await ctx.reply(message);
    }
}