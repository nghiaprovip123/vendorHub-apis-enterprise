import sql from '@/lib/postgresQL'

export class RefreshTokenSessionRepository {
    constructor(private readonly sql: any){}

    async createRefreshTokenSession(authid: string, refreshtokenhash: string, useragent: string | null) {
        await this.sql`
            INSERT INTO refresh_token_sessions (
                authid,
                refreshtokenhash,
                expiresat,
                sessionid,
                useragent
            ) VALUES (
                ${authid},
                ${refreshtokenhash},
                NOW() + INTERVAL '7d',
                gen_random_uuid(),
                ${useragent}
            )
        `
    }

    async findSession(authid: string) {
        const [session] = await this.sql`
            SELECT refreshtokenhash, sessionid
                FROM refresh_token_sessions 
                    WHERE authid = ${authid}
                        AND expiresat > NOW()
                    ORDER BY createdat DESC 
                    LIMIT 1
        `

        return session
    }

    async deleteOldSession(sessionid: string) {
        await sql`
            DELETE FROM refresh_token_sessions 
                WHERE sessionid = ${sessionid}
        `
    }
}