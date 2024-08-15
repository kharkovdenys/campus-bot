import { CommandContext, Context } from 'grammy';

import { addUser, deleteAllHash, deleteUser } from '../services/db';
import { getUserId } from '../utils';

export async function login(ctx: CommandContext<Context>): Promise<void> {
    try {
        const arg = ctx.match.trim().split(' ');
        await ctx.deleteMessage();
        if (arg.length !== 2) throw new Error("Неправильний формат запису");
        const userId = getUserId(ctx);
        await deleteAllHash(userId);
        await deleteUser(userId);
        const data = new URLSearchParams();
        data.append('username', arg[0]);
        data.append('password', arg[1]);
        data.append('grant_type', 'password');

        const response = await fetch("https://api.campus.kpi.ua/oauth/token", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            },
            body: data.toString(),
        });

        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('Введено неправильні дані');
            } else {
                throw new Error('Сайт не відповідає');
            }
        }
        const cookies = response.headers.get('set-cookie') ?? '';
        const SID = cookies.match(/SID=([^;]*);/)?.[1];
        const token = cookies.match(/token=([^;]*);/)?.[1];
        if (!token || !SID) throw new Error('Сайт повертає порожні дані');
        await addUser(userId, token, SID);
        await ctx.reply("Автентифікація пройшла успішно");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}
