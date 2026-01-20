import sql from "@/lib/postgresql"

export type AuthUserEntity = {
    id: string
    name: string | null
    isactive: boolean
    createdat: Date
    updatedat?: Date
}

export type CreateAuthUserInput = {
    name?: string | null
}

export class AuthUserRepository {
    /**
     * Find user by ID
     */
    async findById(tx: any, id: string): Promise<AuthUserEntity | null> {
        const [user] = await tx`
            SELECT * FROM auth_user WHERE id = ${id}
        `
        return user || null
    }

    /**
     * Create new user
     */
    async create(tx: any, input: CreateAuthUserInput = {}): Promise<AuthUserEntity> {
        const { name = null } = input
        
        const [created] = await tx`
            INSERT INTO auth_user (name, isactive, createdat)
            VALUES (${name}, true, NOW())
            RETURNING *
        `
        return created
    }

    /**
     * Create user with default values
     */
    async createDefault(tx: any): Promise<AuthUserEntity> {
        const [created] = await tx`
            INSERT INTO auth_user DEFAULT VALUES
            RETURNING *
        `
        return created
    }

    /**
     * Update user
     */
    async update(tx: any, id: string, updates: Partial<AuthUserEntity>): Promise<AuthUserEntity> {
        const fields = Object.keys(updates)
            .map((key, i) => `${key} = $${i + 2}`)
            .join(', ')
        
        const values = Object.values(updates)
        
        const [updated] = await tx`
            UPDATE auth_user
            SET ${sql(fields)}, updatedat = NOW()
            WHERE id = ${id}
            RETURNING *
        `
        return updated
    }
}

export const authUserRepository = new AuthUserRepository()