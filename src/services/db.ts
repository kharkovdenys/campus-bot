import sql from 'mssql';
import { Hash, User } from '../interfaces';

export default async function startdb(): Promise<void> {
    await sql.connect(process.env.CONNECTION_STRING || '');
}

export async function getUser(userId: string): Promise<User> {
    const result = await sql.query`select * from token where userId = ${userId}`;
    return result.recordset[0];
}

export async function addUser(userId: string, token: string, SID: string): Promise<void> {
    await sql.query`INSERT INTO Token Values(${userId},${token},${SID},0)`;
}

export async function deleteUser(userId: string): Promise<void> {
    await sql.query`DELETE FROM Token WHERE userId = ${userId}`;
}

export async function updateDistribution(userId: string, destribution: boolean): Promise<void> {
    await sql.query`UPDATE Token SET distribution=${destribution ? 1 : 0} WHERE userId = ${userId}`;
}

export async function getDistribution(): Promise<User[]> {
    const result = await sql.query`SELECT userId, token, SID FROM Token WHERE distribution = 1`;
    return result.recordset;
}

export async function getHash(userId: string): Promise<Hash[]> {
    const result = await sql.query`SELECT subjectId, hash256 FROM Hash WHERE userId=${userId}`;
    return result.recordset;
}

export async function deleteAllHash(userId: string): Promise<void> {
    await sql.query`DELETE FROM Hash WHERE userId=${userId}`;
}

export async function insertHash(userId: string, hashes: Hash[]): Promise<void> {
    let command = '';
    hashes.map((hash) => command += `(${userId},'${hash.subjectId}','${hash.hash256}'),\n`);
    command = `INSERT INTO Hash Values${command.slice(0, -2)}`;
    await sql.query(command);
}

export async function updateHash(userId: string, hashes: Hash[]): Promise<void> {
    let command = `DELETE FROM Hash WHERE userId='${userId}' AND subjectId IN (${hashes.map((hash) => `'${hash.subjectId}'`).join(",")})`;
    await sql.query(command);
    command = '';
    hashes.map((hash) => command += `(${userId},'${hash.subjectId}','${hash.hash256}'),\n`);
    command = `INSERT INTO Hash Values${command.slice(0, -2)}`;
    await sql.query(command);
}