import { CommandContext, Context } from 'grammy';

import { getUser } from '../services/db';
import { getPage, getPHPSESSID, getUserId, parseAttestation } from '../utils';

export async function getAttestation(ctx: CommandContext<Context>): Promise<void> {
    try {
        const userId = getUserId(ctx);
        const user = await getUser(userId);
        const PHPSESSID = await getPHPSESSID(user);
        const page = await getPage("https://campus.kpi.ua/student/index.php?mode=attestationresults", user.token, PHPSESSID);
        const attestation = parseAttestation(page);
        await ctx.reply(attestation, { parse_mode: "HTML" });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Сталася невідома помилка";
        await ctx.reply(message);
    }
}
