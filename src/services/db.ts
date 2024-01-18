import sql, { ConnectionPool } from 'mssql';

import { Hash, User } from '../interfaces';

let connectionPool: ConnectionPool | undefined;

async function getConnection(): Promise<ConnectionPool> {
    if (!connectionPool) {
        connectionPool = await sql.connect(process.env.CONNECTION_STRING || '');
    }
    return connectionPool;
}

export async function getUser(userId: string): Promise<User> {
    const connection = await getConnection();
    const result = await connection.query`SELECT * FROM token WHERE userId = ${userId}`;
    return result.recordset[0];
}

export async function addUser(userId: string, token: string, SID: string): Promise<void> {
    const connection = await getConnection();
    await connection.query`INSERT INTO Token Values(${userId},${token},${SID},0)`;
}

export async function deleteUser(userId: string): Promise<void> {
    const connection = await getConnection();
    await connection.query`DELETE FROM Token WHERE userId = ${userId}`;
}

export async function updateDistribution(userId: string, distribution: boolean): Promise<void> {
    const connection = await getConnection();
    await connection.query`UPDATE Token SET distribution=${distribution ? 1 : 0} WHERE userId = ${userId}`;
}

export async function getDistribution(): Promise<User[]> {
    const connection = await getConnection();
    const result = await connection.query`SELECT userId, token, SID FROM Token WHERE distribution = 1`;
    return result.recordset;
}

export async function getHash(userId: string): Promise<Hash[]> {
    const connection = await getConnection();
    const result = await connection.query`SELECT subjectId, hash256 FROM Hash WHERE userId=${userId}`;
    return result.recordset;
}

export async function deleteAllHash(userId: string): Promise<void> {
    const connection = await getConnection();
    await connection.query`DELETE FROM Hash WHERE userId=${userId}`;
}

export async function updateHash(userId: string, hashes: Hash[]): Promise<void> {
    const connection = await getConnection();
    let command = `DELETE FROM Hash WHERE userId='${userId}' AND subjectId IN (${hashes.map((hash) => `'${hash.subjectId}'`).join(",")})`;
    await connection.query(command);
    command = '';
    hashes.forEach((hash) => command += `(${userId},'${hash.subjectId}','${hash.hash256}'),\n`);
    command = `INSERT INTO Hash Values${command.slice(0, -2)}`;
    await connection.query(command);
}
