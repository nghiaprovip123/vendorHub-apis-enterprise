import sql from "@/lib/postgresql"

export class AuthenticationUserRepository {
    constructor(private readonly sql: any) {}

    async createNewAuthenticationUser(name?: string) {
        const [{ id }] = await this.sql`
          INSERT INTO auth_user (name, isactive)
          VALUES (${name ?? null}, true)
          RETURNING id
        `
        return { id }
      }      
      
}