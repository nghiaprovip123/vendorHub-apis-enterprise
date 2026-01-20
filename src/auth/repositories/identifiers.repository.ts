import sql from "@/lib/postgresql"
import { IdentifierType } from "@/auth/enum/identifier-type.enum"

export type IdentifierEntity = {
    id: string
    authid: string
    type: IdentifierType
    value: string
    isverified: boolean
    isactive: boolean
    createdat: Date
    verifiedat?: Date
}

export type CreateIdentifierInput = {
    authid: string
    type: IdentifierType
    value: string
    isverified?: boolean
    isactive?: boolean
    userAgent?: string | null
}

export class IdentifierRepository {
    /**
     * Find identifier by email
     */
    async findByEmail(email: string): Promise<IdentifierEntity | null> {
        const [identifier] = await sql`
            SELECT *
            FROM identifiers
            WHERE type = ${IdentifierType.EMAIL}
                AND value = ${email}
                AND isactive = true
            LIMIT 1
        `
        return identifier || null
    }

    /**
     * Find identifier by authid and type
     */
    async findByAuthIdAndType(tx: any, authid: string, type: IdentifierType): Promise<IdentifierEntity | null> {
        const [identifier] = await tx`
            SELECT *
            FROM identifiers
            WHERE authid = ${authid}
                AND type = ${type}
                AND isactive = true
            LIMIT 1
        `
        return identifier || null
    }

    /**
     * Find password hash by authid
     */
    async findPasswordHash(authid: string): Promise<string | null> {
        const [passwordRow] = await sql`
            SELECT value AS "hashPassword"
            FROM identifiers
            WHERE authid = ${authid}
                AND type = ${IdentifierType.PASSWORD}
                AND isactive = true
        `
        return passwordRow?.hashPassword || null
    }

    /**
     * Create identifier
     */
    async create(tx: any, input: CreateIdentifierInput): Promise<IdentifierEntity> {
        const {
            authid,
            type,
            value,
            isverified = true,
            isactive = true,
            userAgent = null
        } = input

        const [created] = await tx`
            INSERT INTO identifiers (
                authid,
                type,
                value,
                isverified,
                isactive,
                useragent,
                createdat
            )
            VALUES (
                ${authid},
                ${type},
                ${value},
                ${isverified},
                ${isactive},
                ${userAgent},
                NOW()
            )
            RETURNING *
        `
        return created
    }

    /**
     * Update identifier value (e.g., password)
     */
    async updateValue(tx: any, authid: string, type: IdentifierType, newValue: string): Promise<IdentifierEntity> {
        const [updated] = await tx`
            UPDATE identifiers
            SET value = ${newValue},
                isverified = true,
                isactive = true,
                updatedat = NOW()
            WHERE authid = ${authid}
                AND type = ${type}
            RETURNING *
        `
        return updated
    }

    /**
     * Check if identifier exists
     */
    async exists(tx: any, authid: string, type: IdentifierType): Promise<boolean> {
        const [result] = await tx`
            SELECT EXISTS(
                SELECT 1
                FROM identifiers
                WHERE authid = ${authid}
                    AND type = ${type}
                    AND isactive = true
            ) as exists
        `
        return result.exists
    }
}

export const identifierRepository = new IdentifierRepository()