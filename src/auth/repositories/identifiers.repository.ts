import sql from "@/lib/postgresql"
import { IdentifierType } from "../enum/identifier-type.enum"

export class IdentifiersRepository {
    constructor (private readonly sql: any) {}

    async checkExistenceOfIdentifier(type: string, value: string) {
        const [existing] = await this.sql`
            SELECT authid 
                FROM identifiers
                    WHERE type = ${type}
                        AND value = ${value}
                        AND isactive = true

        `
        return existing
    }

    async findIdentifier(type: string, value: string) {
        const [identifier] = await sql`
            SELECT authid
                FROM identifiers
                    WHERE type = ${type}
                        AND value = ${value}
        `

        return identifier
    }

    async insertIdentifiers (authid: string, type: string, value: string) {
        await this.sql`
            INSERT INTO identifiers (
                authid,
                type,
                value,
                isverified,
                isactive
            ) VALUES (
                ${authid},
                ${type},
                ${value},
                true,
                true
            )
        `
    }

    async createPasswordIdentifier (type: string, value: string, authid: string) {
        await this.sql`
            INSERT INTO identifiers (type, value, isverified, isactive, authid)
            VALUES (
                ${type},
                ${value},
                true,
                true,
                ${authid}
            )
        `
    }

    async updatePasswordIdentifier (type: string, authid: string, value: string) {
        await this.sql`
            UPDATE identifiers 
                SET value = ${value},
                    isverified = true,
                    isactive = true
                WHERE authid = ${authid}
                    AND type = ${type}
        `
    }

    async findPasswordIdentifier (authid: string, type: string) {
        const [passwordRow] = await sql`
            SELECT value AS "hashPassword"
                FROM identifiers
                    WHERE authid = ${authid}
                        AND type = ${IdentifierType.PASSWORD}
        `

        return passwordRow
    }

}