"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenSessionRepository = void 0;
const postgresql_1 = __importDefault(require("../../lib/postgresql"));
class RefreshTokenSessionRepository {
    constructor(sql) {
        this.sql = sql;
    }
    async createRefreshTokenSession(authid, refreshtokenhash, useragent) {
        await this.sql `
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
        `;
    }
    async findSession(authid) {
        const [session] = await this.sql `
            SELECT refreshtokenhash, sessionid
                FROM refresh_token_sessions 
                    WHERE authid = ${authid}
                        AND expiresat > NOW()
                    ORDER BY createdat DESC 
                    LIMIT 1
        `;
        return session;
    }
    async deleteOldSession(sessionid) {
        await (0, postgresql_1.default) `
            DELETE FROM refresh_token_sessions 
                WHERE sessionid = ${sessionid}
        `;
    }
}
exports.RefreshTokenSessionRepository = RefreshTokenSessionRepository;
