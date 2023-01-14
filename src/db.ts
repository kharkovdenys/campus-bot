import sql from 'mssql';

export default async function startdb(): Promise<void> {
    try {
        await sql.connect(process.env.CONNECTION_STRING || '');
    } catch (err) {
        console.log(err);
    }
}

export async function getToken(userId: string): Promise<string | undefined> {
    try {
        const result = await sql.query`select * from token where userId = ${userId}`;
        return result.recordset[0].token;
    } catch {
        return undefined;
    }
}

export async function addToken(userId: string, token: string): Promise<boolean> {
    try {
        await sql.query`INSERT INTO Token Values(${userId},${token},0)`;
        return true;
    } catch {
        return false;
    }
}

export async function deleteToken(userId: string): Promise<boolean> {
    try {
        await sql.query`DELETE FROM Token WHERE userId = ${userId}`;
        return true;
    } catch {
        return false;
    }
}

export async function updateDistribution(userId: string, destribution: boolean): Promise<boolean> {
    try {
        await sql.query`UPDATE Token SET distribution=${destribution ? 1 : 0} WHERE userId = ${userId}`;
        return true;
    } catch (e) {
        return false;
    }
}

export async function getDistribution(): Promise<{ userId: string; token: string }[] | undefined> {
    try {
        const result = await sql.query`SELECT userId, token FROM Token WHERE distribution = 1`;
        return result.recordset;
    } catch (e) {
        return undefined;
    }
}

export async function getHash(userId: string): Promise<{ subjectId: string, hash256: string }[] | undefined> {
    try {
        const result = await sql.query`SELECT subjectId, hash256 FROM Hash WHERE userId=${userId}`;
        return result.recordset;
    } catch (e) {
        return undefined;
    }
}

export async function deleteAllHash(userId: string): Promise<boolean> {
    try {
        await sql.query`DELETE FROM Hash WHERE userId=${userId}`;
        return true;
    } catch (e) {
        return false;
    }
}

export async function insertHash(userId: string, hashes: { subjectId: string, hash256: string }[]): Promise<boolean> {
    try {
        let command = '';
        hashes.map((hash) => command += `(${userId},'${hash.subjectId}','${hash.hash256}'),\n`);
        command = `INSERT INTO Hash Values${command.slice(0, -2)}`;
        await sql.query(command);
        return true;
    } catch (e) {
        return false;
    }
}

export async function updateHash(userId: string, hashes: { subjectId: string, hash256: string }[]): Promise<boolean> {
    try {
        let command = `DELETE FROM Hash WHERE userId='${userId}' AND subjectId IN (${hashes.map((hash) => `'${hash.subjectId}'`).join(",")})`;
        await sql.query(command);
        command = '';
        hashes.map((hash) => command += `(${userId},'${hash.subjectId}','${hash.hash256}'),\n`);
        command = `INSERT INTO Hash Values${command.slice(0, -2)}`;
        await sql.query(command);
        return true;
    } catch (e) {
        console.log(e);
        return false;
    }
}