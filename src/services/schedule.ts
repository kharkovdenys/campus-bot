import { Api, RawApi } from 'grammy';

import { checkHesh } from '../commands';
import { User } from '../interfaces';
import { getDistribution, getHash } from './db';

export async function check(api: Api<RawApi>, user: User): Promise<void> {
    try {
        const hashes = await getHash(user.userId);
        if (hashes) await checkHesh(user, hashes, api);
    } catch {
        console.log("Validation error userId:", user.userId);
    }
}

export async function sendRequests(): Promise<void> {
    try {
        const users: User[] = await getDistribution().catch(() => {
            console.log("Error getting users");
            return [];
        });

        for (const user of users) {
            try {
                const response = await fetch(`${process.env.URL}/check`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'cron': process.env.CRON_CODE || '',
                    },
                    body: JSON.stringify(user),
                });

                if (!response.ok) {
                    throw new Error(`Failed to send request: ${response.statusText}`);
                }
            } catch (error) {
                console.log("Error sending request", error);
            }
        }
    } catch (error) {
        console.log("Error processing requests", error);
    }
}
