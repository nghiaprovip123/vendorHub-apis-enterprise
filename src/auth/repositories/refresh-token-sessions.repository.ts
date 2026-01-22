import sql from '@/lib/postgresql'

export class RefreshTokenSessionRepository {
    constructor(private readonly sql: any){}

    async createRefreshTokenSession(authid: string, refreshtokenhash: string, useragent: string) {
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
}