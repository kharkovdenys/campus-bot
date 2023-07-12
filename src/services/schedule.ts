import axios from "axios";
import { Api, RawApi } from "grammy";
import { checkHesh } from "../commands";
import { User } from "../interfaces";
import { getDistribution, getHash } from "./db";

export async function check(api: Api<RawApi>, user: User): Promise<void> {
    try {
        const hashes = await getHash(user.userId);
        if (hashes) await checkHesh(user, hashes, api);
    } catch {
        console.log("Validation error userId:", user.userId);
    }
}

export async function sendRequests(): Promise<void> {
    const users: User[] = await getDistribution().catch(() => {
        console.log("Error getting users");
        return [];
    });
    for (const user of users) {
        axios.post(process.env.URL + "/check", user, {
            headers: { cron: process.env.CRON_CODE },
        }).catch((error) => console.log("Error sending request", error));
    }
}
