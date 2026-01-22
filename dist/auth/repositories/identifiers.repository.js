"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentifiersRepository = void 0;
const postgresql_1 = __importDefault(require("@/lib/postgresql"));
const identifier_type_enum_1 = require("../enum/identifier-type.enum");
class IdentifiersRepository {
    constructor(sql) {
        this.sql = sql;
    }
    async checkExistenceOfIdentifier(type, value) {
        const [existing] = await this.sql `
            SELECT authid 
                FROM identifiers
                    WHERE type = ${type}
                        AND value = ${value}
                        AND isactive = true

        `;
        return existing;
    }
    async findIdentifier(type, value) {
        const [identifier] = await (0, postgresql_1.default) `
            SELECT authid
                FROM identifiers
                    WHERE type = ${type}
                        AND value = ${value}
        `;
        return identifier;
    }
    async insertIdentifiers(authid, type, value) {
        await this.sql `
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
        `;
    }
    async createPasswordIdentifier(type, value, authid) {
        await this.sql `
            INSERT INTO identifiers (type, value, isverified, isactive, authid)
            VALUES (
                ${type},
                ${value},
                true,
                true,
                ${authid}
            )
        `;
    }
    async updatePasswordIdentifier(type, authid, value) {
        await this.sql `
            UPDATE identifiers 
                SET value = ${value},
                    isverified = true,
                    isactive = true
                WHERE authid = ${authid}
                    AND type = ${type}
        `;
    }
    async findPasswordIdentifier(authid, type) {
        const [passwordRow] = await this.sql `
            SELECT value AS "hashPassword"
                FROM identifiers
                    WHERE authid = ${authid}
                        AND type = ${identifier_type_enum_1.IdentifierType.PASSWORD}
        `;
        return passwordRow;
    }
    async findEmailIdentifier(authid, type) {
        const [{ email }] = await this.sql `
            SELECT value AS email
                FROM identifiers
                    WHERE type = ${type}
                        AND authid = ${authid}
        `;
        return email;
    }
}
exports.IdentifiersRepository = IdentifiersRepository;
