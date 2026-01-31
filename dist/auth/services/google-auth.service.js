"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleCallbackAuthService = void 0;
const postgresQL_1 = __importDefault(require("../../lib/postgresQL"));
const argon2_1 = __importDefault(require("argon2"));
const index_jwt_1 = require("../../common/jwt/index.jwt");
const google_oauth_service_1 = require("../../auth/services/google-oauth.service");
const refresh_token_sessions_repository_1 = require("../../auth/repositories/refresh-token-sessions.repository");
const identifiers_repository_1 = require("../../auth/repositories/identifiers.repository");
const identifier_type_enum_1 = require("../../auth/enum/identifier-type.enum");
class GoogleCallbackAuthService {
    static async execute(params) {
        const { code, userAgent } = params;
        const refreshTokenSessionRepo = new refresh_token_sessions_repository_1.RefreshTokenSessionRepository(postgresQL_1.default);
        const tokenData = await google_oauth_service_1.GoogleOpenAuthorizationService.exchangeGoogleTokens({ code });
        const googleAccessToken = tokenData.access_token;
        const googleUser = await google_oauth_service_1.GoogleOpenAuthorizationService.fetchUserInfo({
            access_token: googleAccessToken,
        });
        if (!googleUser.email) {
            throw new Error("GOOGLE_ACCOUNT_HAS_NO_EMAIL");
        }
        const email = googleUser.email;
        const authId = await this.resolveAuthUser(email, userAgent);
        const refreshToken = await index_jwt_1.jwtService.generateRefreshToken({
            sub: authId,
            email,
            jti: index_jwt_1.jwtService.generateJit(),
        }, 60 * 60 * 24 * 7);
        const refreshTokenHash = await argon2_1.default.hash(refreshToken);
        await refreshTokenSessionRepo.createRefreshTokenSession(authId, refreshTokenHash, userAgent);
        const accessToken = await index_jwt_1.jwtService.generateAccessToken({
            sub: authId,
            email,
            jti: index_jwt_1.jwtService.generateJit(),
        }, 60 * 5);
        return { accessToken, refreshToken };
    }
    static async resolveAuthUser(email, userAgent) {
        const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(postgresQL_1.default);
        const existing = await identifiersRepo.checkExistenceOfIdentifier(identifier_type_enum_1.IdentifierType.EMAIL, email);
        if (existing) {
            return existing.authid;
        }
        const [created] = await (0, postgresQL_1.default) `
      INSERT INTO auth_user DEFAULT VALUES
      RETURNING id
    `;
        await (0, postgresQL_1.default) `
      INSERT INTO identifiers (
        type,
        value,
        isverified,
        isactive,
        authid
      )
      VALUES (
        'email',
        ${email},
        true,
        true,
        ${created.id}
      )
    `;
        return created.id;
    }
}
exports.GoogleCallbackAuthService = GoogleCallbackAuthService;
