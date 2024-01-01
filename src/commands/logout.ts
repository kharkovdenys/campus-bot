import { CommandContext, Context } from 'grammy';

import { deleteAllHash, deleteUser } from '../services/db';
import { getUserId } from '../utils';

export async function logout(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        await deleteAllHash(userId);
        await deleteUser(userId);
        await ctx.reply("Вихід відбувся успішно");
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}
