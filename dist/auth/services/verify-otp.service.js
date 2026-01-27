"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPService = exports.VerifyOTPService = void 0;
const postgresql_1 = __importDefault(require("../../lib/postgresql"));
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const index_jwt_1 = require("../../common/jwt/index.jwt");
const veirfy_otp_type_enum_1 = require("../../auth/enum/veirfy-otp-type.enum");
const identifier_type_enum_1 = require("../../auth/enum/identifier-type.enum");
const otp_repository_1 = require("../../auth/repositories/otp.repository");
const identifiers_repository_1 = require("../../auth/repositories/identifiers.repository");
const auth_user_repository_1 = require("../../auth/repositories/auth-user.repository");
class VerifyOTPService {
    async verifyOtpByRegisterationFlow({ otp, email, name, }) {
        const result = await postgresql_1.default.begin(async (tx) => {
            const otpRepo = new otp_repository_1.OTPRepository(tx);
            const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(tx);
            const authenticationUserRepository = new auth_user_repository_1.AuthenticationUserRepository(tx);
            const otpRow = await otpRepo.findOTPForVerification(otp, email, veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_REGISTERATION);
            if (!otpRow) {
                throw new ApiError_utils_1.default(400, 'OTP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN');
            }
            const existing = await identifiersRepo.checkExistenceOfIdentifier(identifier_type_enum_1.IdentifierType.EMAIL, email);
            let authUserId;
            if (existing?.authid) {
                authUserId = existing.authid;
            }
            else {
                const createAuthUser = await authenticationUserRepository.createNewAuthenticationUser(name);
                authUserId = createAuthUser.id;
                await identifiersRepo.insertIdentifiers(authUserId, identifier_type_enum_1.IdentifierType.EMAIL, email);
            }
            await otpRepo.setOTPAsVerified(otpRow.id);
            return {
                authUserId,
                email
            };
        });
        const accessToken = index_jwt_1.jwtService.generateAccessToken({
            sub: result.authUserId,
            email: result.email,
            jti: index_jwt_1.jwtService.generateJit(),
        }, 300);
        return { accessToken };
    }
    async verifyOtpByForgotFlow(input) {
        const { otp, email } = input;
        if (!otp || !email) {
            throw new ApiError_utils_1.default(400, 'OTP VÀ EMAIL LÀ BẮT BUỘC');
        }
        const result = await postgresql_1.default.begin(async (tx) => {
            const otpRepo = new otp_repository_1.OTPRepository(tx);
            const identifiersRepo = new identifiers_repository_1.IdentifiersRepository(tx);
            const otpRow = await otpRepo.findOTPForVerification(otp, email, veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD);
            if (!otpRow) {
                throw new ApiError_utils_1.default(401, 'OTP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN');
            }
            const findUser = await identifiersRepo.checkExistenceOfIdentifier(identifier_type_enum_1.IdentifierType.EMAIL, email);
            if (!findUser) {
                throw new ApiError_utils_1.default(404, 'NGƯỜI DÙNG KHÔNG TỒN TẠI');
            }
            await otpRepo.setOTPAsVerified(otpRow.id);
            return {
                authUserId: findUser.authid
            };
        });
        const resetToken = index_jwt_1.jwtService.generateResetToken({
            sub: result.authUserId,
            purpose: veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD,
            jti: index_jwt_1.jwtService.generateJit()
        }, 150);
        return { resetToken };
    }
}
exports.VerifyOTPService = VerifyOTPService;
exports.verifyOTPService = new VerifyOTPService();
