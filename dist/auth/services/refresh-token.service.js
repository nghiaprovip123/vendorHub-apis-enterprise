"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const postgresql_1 = __importDefault(require("@/lib/postgresql"));
const argon2_1 = __importDefault(require("argon2"));
const index_jwt_1 = require("@/common/jwt/index.jwt");
const refresh_token_sessions_repository_1 = require("@/auth/repositories/refresh-token-sessions.repository");
const identifiers_repository_1 = require("@/auth/repositories/identifiers.repository");
const identifier_type_enum_1 = require("@/auth/enum/identifier-type.enum");
class RefreshTokenService {
    static async execute(refreshToken, userAgent) {
        const payload = await index_jwt_1.jwtService.verifyRefreshToken(refreshToken);
        if (!payload) {
            throw new Error("SAI TOKEN, VUI LÒNG THỬ LẠI");
        }
        const { sub } = payload;
        return await postgresql_1.default.begin(async (tx) => {
            const refreshTokenSessionRepo = new refresh_token_sessions_repository_1.RefreshTokenSessionRepository(tx);
            const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(tx);
            const session = await refreshTokenSessionRepo.findSession(sub);
            if (!session) {
                throw new Error("KHÔNG TÌM THẤY SESSION REFRESH TOKEN");
            }
            const isValid = await argon2_1.default.verify(session.refreshtokenhash, refreshToken);
            if (!isValid) {
                throw new Error("REFRESH TOKEN KHÔNG HỢP LỆ");
            }
            // Rotate: xoá session cũ
            await refreshTokenSessionRepo.deleteOldSession(session.sessionid);
            const email = await identifiersRepo.findEmailIdentifier(sub, identifier_type_enum_1.IdentifierType.EMAIL);
            const accessToken = index_jwt_1.jwtService.generateAccessToken({
                sub,
                email,
                jti: index_jwt_1.jwtService.generateJit(),
            }, 300);
            const newRefreshToken = index_jwt_1.jwtService.generateRefreshToken({
                sub,
                email,
                jti: index_jwt_1.jwtService.generateJit(),
            }, 604800);
            const newRefreshTokenHash = await argon2_1.default.hash(newRefreshToken);
            await refreshTokenSessionRepo.createRefreshTokenSession(sub, newRefreshTokenHash, userAgent);
            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        });
    }
}
exports.RefreshTokenService = RefreshTokenService;
