import { MongoClient, Db, Collection } from 'mongodb';

import { Hash, User } from '../interfaces';

let db: Db | undefined;

async function getDb(): Promise<Db> {
    if (!db) {
        const client = new MongoClient(process.env.CONNECTION_STRING || '');
        await client.connect();
        db = client.db(process.env.DB_NAME || 'db');
    }
    return db;
}

export async function getUser(userId: number): Promise<User> {
    const db = await getDb();
    const collection: Collection<User> = db.collection('token');
    const user = await collection.findOne({ userId });
    if (user === null) throw Error("Користувач не авторизований");
    return user;
}

export async function addUser(userId: number, token: string, SID: string): Promise<void> {
    const db = await getDb();
    const collection: Collection<User> = db.collection('token');
    await collection.insertOne({ userId, token, SID, distribution: false });
}

export async function deleteUser(userId: number): Promise<void> {
    const db = await getDb();
    const collection: Collection<User> = db.collection('token');
    await collection.deleteOne({ userId });
}

export async function updateDistribution(userId: number, distribution: boolean): Promise<void> {
    const db = await getDb();
    const collection: Collection<User> = db.collection('token');
    await collection.updateOne({ userId }, { $set: { distribution } });
}

export async function getDistribution(): Promise<User[]> {
    const db = await getDb();
    const collection: Collection<User> = db.collection('token');
    return await collection.find({ distribution: true }).toArray();
}

export async function getHash(userId: number): Promise<Hash[]> {
    const db = await getDb();
    const collection: Collection<Hash> = db.collection('hash');
    return await collection.find({ userId }).toArray();
}

export async function deleteAllHash(userId: number): Promise<void> {
    const db = await getDb();
    const collection: Collection<Hash> = db.collection('hash');
    await collection.deleteMany({ userId });
}

export async function updateHash(userId: number, hashes: Hash[]): Promise<void> {
    const db = await getDb();
    const collection: Collection<Hash> = db.collection('hash');

    const bulkOps = hashes.map((hash) => ({
        replaceOne: {
            filter: { userId, subjectId: hash.subjectId },
            replacement: { userId, subjectId: hash.subjectId, hash256: hash.hash256 },
            upsert: true,
        },
    }));

    await collection.bulkWrite(bulkOps);
}
