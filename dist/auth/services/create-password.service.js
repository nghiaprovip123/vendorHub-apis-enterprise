"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordService = exports.CreatePasswordService = void 0;
const postgresql_1 = __importDefault(require("@/lib/postgresql"));
const identifier_type_enum_1 = require("@/auth/enum/identifier-type.enum");
const veirfy_otp_type_enum_1 = require("@/auth/enum/veirfy-otp-type.enum");
const password_utils_1 = require("@/common/utils/password.utils");
const identifiers_repository_1 = require("@/auth/repositories/identifiers.repository");
class CreatePasswordService {
    async createPasswordByRegisterationFlow(params) {
        const { userId, password } = params;
        const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(postgresql_1.default);
        const [user] = await (0, postgresql_1.default) `
            SELECT * FROM auth_user
            WHERE id = ${userId}
        `;
        if (!user) {
            throw new Error("KHÔNG TÌM THẤY USER");
        }
        const hashPassword = await password_utils_1.PasswordUtilities.hashPassword(password);
        try {
            await identifiersRepo.createPasswordIdentifier(identifier_type_enum_1.IdentifierType.PASSWORD, hashPassword, userId);
        }
        catch (err) {
            if (err.code === "23505") {
                throw new Error("KHÔNG THỂ TẠO MẬT KHẨU VÌ NGƯỜI DÙNG ĐÃ TỒN TẠI");
            }
            throw err;
        }
        return user;
    }
    async createPasswordByForgotFlow(params) {
        const { extractedUser, password } = params;
        const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(postgresql_1.default);
        const { sub, purpose } = extractedUser;
        const [user] = await (0, postgresql_1.default) `
            SELECT * FROM auth_user
            WHERE id = ${sub}
        `;
        if (!user) {
            throw new Error("KHÔNG TÌM THẤY USER");
        }
        if (purpose !== veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD) {
            throw new Error("TOKEN KHÔNG CÓ HIỆU LỰC Ở API NÀY");
        }
        const hashPassword = await password_utils_1.PasswordUtilities.hashPassword(password);
        try {
            await identifiersRepo.updatePasswordIdentifier(identifier_type_enum_1.IdentifierType.PASSWORD, sub, hashPassword);
        }
        catch (err) {
            if (err.code === "23505") {
                throw new Error("KHÔNG THỂ TẠO MẬT KHẨU VÌ NGƯỜI DÙNG ĐÃ TỒN TẠI");
            }
            throw err;
        }
        return user;
    }
}
exports.CreatePasswordService = CreatePasswordService;
exports.createPasswordService = new CreatePasswordService();
