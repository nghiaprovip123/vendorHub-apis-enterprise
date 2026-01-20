import sql from "@/lib/postgresql"

export type RefreshTokenSessionEntity = {
    id: string
    authid: string
    refreshtokenhash: string
    sessionid: string
    expiresat: Date
    useragent: string | null
    revoked: boolean
    revokedat?: Date
    revokedby?: string
    createdat: Date
}

export type CreateRefreshTokenSessionInput = {
    authid: string
    refreshTokenHash: string
    expiresAt: Date
    userAgent?: string | null
}

export class RefreshTokenSessionRepository {
    /**
     * Find active session by authid
     */
    async findActiveSession(tx: any, authid: string): Promise<RefreshTokenSessionEntity | null> {
        const [session] = await tx`
            SELECT *
            FROM refresh_token_sessions
            WHERE authid = ${authid}
                AND expiresat > NOW()
                AND revoked = false
            ORDER BY createdat DESC
            LIMIT 1
        `
        return session || null
    }

    /**
     * Create new refresh token session
     */
    async create(tx: any, input: CreateRefreshTokenSessionInput): Promise<RefreshTokenSessionEntity> {
        const { authid, refreshTokenHash, expiresAt, userAgent = null } = input

        const [created] = await tx`
            INSERT INTO refresh_token_sessions (
                authid,
                refreshtokenhash,
                expiresat,
                sessionid,
                useragent
            )
            VALUES (
                ${authid},
                ${refreshTokenHash},
                ${expiresAt},
                gen_random_uuid(),
                ${userAgent}
            )
            RETURNING *
        `
        return created
    }

    /**
     * Delete session by sessionid
     */
    async deleteBySessionId(tx: any, sessionId: string): Promise<void> {
        await tx`
            DELETE FROM refresh_token_sessions
            WHERE sessionid = ${sessionId}
        `
    }

    /**
     * Revoke all sessions for user
     */
    async revokeAllByAuthId(authid: string, revokedBy: string): Promise<void> {
        await sql`
            UPDATE refresh_token_sessions
            SET revoked = true,
                revokedat = NOW(),
                revokedby = ${revokedBy}
            WHERE authid = ${authid}
                AND revoked = false
        `
    }

    /**
     * Revoke specific session
     */
    async revokeSession(tx: any, sessionId: string, revokedBy: string): Promise<void> {
        await tx`
            UPDATE refresh_token_sessions
            SET revoked = true,
                revokedat = NOW(),
                revokedby = ${revokedBy}
            WHERE sessionid = ${sessionId}
        `
    }

    /**
     * Clean expired sessions
     */
    async cleanExpiredSessions(): Promise<number> {
        const result = await sql`
            DELETE FROM refresh_token_sessions
            WHERE expiresat < NOW()
            RETURNING id
        `
        return result.length
    }
}

export const refreshTokenSessionRepository = new RefreshTokenSessionRepository()