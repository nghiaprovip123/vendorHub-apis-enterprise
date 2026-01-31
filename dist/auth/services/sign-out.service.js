"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignOutService = void 0;
const postgresQL_1 = __importDefault(require("../../lib/postgresQL"));
class SignOutService {
    async execute(extractedUser) {
        const { sub } = extractedUser;
        if (!sub) {
            throw new Error("INVALID_TOKEN_PAYLOAD");
        }
        await (0, postgresQL_1.default) `
      UPDATE refresh_token_sessions
      SET revoked = true,
          revokedat = NOW(),
          revokedby = ${sub}
      WHERE authid = ${sub}
        AND revoked = false
    `;
    }
}
exports.SignOutService = SignOutService;
