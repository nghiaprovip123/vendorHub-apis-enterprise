import sql from "@/lib/postgresql"

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

}