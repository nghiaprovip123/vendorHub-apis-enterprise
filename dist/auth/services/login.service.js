"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.LoginService = void 0;
const postgresQL_1 = __importDefault(require("@/lib/postgresQL"));
const argon2_1 = __importDefault(require("argon2"));
const identifier_type_enum_1 = require("@/auth/enum/identifier-type.enum");
const index_jwt_1 = require("@/common/jwt/index.jwt");
const password_utils_1 = require("@/common/utils/password.utils");
const identifiers_repository_1 = require("@/auth/repositories/identifiers.repository");
const refresh_token_sessions_repository_1 = require("@/auth/repositories/refresh-token-sessions.repository");
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(postgresQL_1.default);
const refreshTokenSessionRepo = new refresh_token_sessions_repository_1.RefreshTokenSessionRepository(postgresQL_1.default);
class LoginService {
    async login({ email, password, userAgent }) {
        const identifier = await identifiersRepo.findIdentifier(identifier_type_enum_1.IdentifierType.EMAIL, email);
        if (!identifier?.authid) {
            throw new ApiError_utils_1.default(403, 'TÀI KHOẢN KHÔNG TỒN TẠI HOẶC ĐÃ BỊ TẠM KHOÁ');
        }
        const authid = identifier.authid;
        const passwordRow = await identifiersRepo.findPasswordIdentifier(authid, identifier_type_enum_1.IdentifierType.PASSWORD);
        if (!passwordRow?.hashPassword) {
            throw new ApiError_utils_1.default(500, 'PASSWORD KHÔNG CHÍNH XÁC');
        }
        const isValid = await password_utils_1.PasswordUtilities.comparePassword(passwordRow.hashPassword, password);
        if (!isValid) {
            throw new ApiError_utils_1.default(401, 'KHÔNG ĐÚNG THÔNG TIN ĐĂNG NHẬP');
        }
        const refreshToken = await index_jwt_1.jwtService.generateRefreshToken({
            sub: authid,
            email,
            jti: index_jwt_1.jwtService.generateJit(),
        }, 604800);
        const refreshTokenHash = await argon2_1.default.hash(refreshToken);
        await refreshTokenSessionRepo.createRefreshTokenSession(authid, refreshTokenHash, userAgent);
        return { refreshToken };
    }
}
exports.LoginService = LoginService;
exports.authService = new LoginService();
