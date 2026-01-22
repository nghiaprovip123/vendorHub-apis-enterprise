"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationUserRepository = void 0;
class AuthenticationUserRepository {
    constructor(sql) {
        this.sql = sql;
    }
    async createNewAuthenticationUser(name) {
        const [{ id }] = await this.sql `
          INSERT INTO auth_user (name, isactive)
          VALUES (${name ?? null}, true)
          RETURNING id
        `;
        return { id };
    }
}
exports.AuthenticationUserRepository = AuthenticationUserRepository;
