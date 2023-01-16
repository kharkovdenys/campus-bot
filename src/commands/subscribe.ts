import { CommandContext, Context } from "grammy";
import { deleteAllHash, getToken, updateDistribution } from "../services/db";
import { checkHesh } from "./checkHesh";

export async function subscribe(ctx: CommandContext<Context>): Promise<void> {
    if (!ctx.from) { ctx.reply("Сталася якась помилка"); return; }
    if (await updateDistribution(ctx.from.id.toString(), true)) {
        await deleteAllHash(ctx.from.id.toString());
        const token = await getToken(ctx.from.id.toString());
        if (!token) { ctx.reply("Ви не пройшли автентифікацію"); return; }
        await checkHesh({ userId: ctx.from.id.toString(), token }, []);
        ctx.reply("Ви успішно підписалися");
    }
    else
        ctx.reply("Сталася якась помилка");
}