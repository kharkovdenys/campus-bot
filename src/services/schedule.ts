import { Api, RawApi } from "grammy";
import { checkHesh } from "../commands";
import { User } from "../interfaces";
import { getDistribution, getHash } from "./db";

export default async function check(api: Api<RawApi>): Promise<void> {
    const users: User[] = await getDistribution().catch(() => []);
    for (let i = 0; i < users.length; i++) {
        try {
            const hashes = await getHash(users[i].userId);
            if (hashes)
                await checkHesh(users[i], hashes, api);
        }
        catch {
            console.log('Validation error userId:', users[i].userId);
        }
    }
}