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