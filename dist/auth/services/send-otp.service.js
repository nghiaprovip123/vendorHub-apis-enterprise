"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPService = exports.SendOTPService = void 0;
const postgresQL_1 = __importDefault(require("../../lib/postgresQL"));
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const crypto_1 = __importDefault(require("crypto"));
const send_otp_helper_utils_1 = require("../../common/utils/send-otp-helper.utils");
const veirfy_otp_type_enum_1 = require("../../auth/enum/veirfy-otp-type.enum");
const otp_repository_1 = require("../../auth/repositories/otp.repository");
const rate_limit_utils_1 = require("../../common/utils/rate-limit.utils");
class SendOTPService {
    async sendOTP(email, phone, type) {
        switch (type) {
            case veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_REGISTERATION:
                if (!email || !phone)
                    throw new ApiError_utils_1.default(400, 'Email and phone are required');
                break;
            case veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD:
                if (!email)
                    throw new ApiError_utils_1.default(400, 'Email is required');
                break;
            default:
                throw new ApiError_utils_1.default(400, 'Invalid OTP type');
        }
        let result;
        try {
            result = await postgresQL_1.default.begin(async (trx) => {
                const otpRepo = new otp_repository_1.OTPRepository(trx);
                ////////////////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: Count the OTP by email within 15 minutes //
                const count = await otpRepo.countOTPWithin15Minutes(email, type);
                if (count >= rate_limit_utils_1.RateLimit.SEND_OTP_RATE_LIMIT) {
                    throw new ApiError_utils_1.default(429, "KHÔNG THỂ GỬI OTP VÌ SỐ LẦN GỬI OTP ĐÃ ĐẠT GIỚI HẠN");
                }
                ////////////////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: De-Active all the old OTPs for the new process //
                await otpRepo.deactiveOldOTPs(email, phone, type);
                const generateOTP = crypto_1.default.randomInt(100000, 999999).toString();
                ////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: Create the new OTP by email //
                const createNewOTP = await otpRepo.createNewOTP(email, phone, type, generateOTP);
                /////////////////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: Select the OTP that is just sent by Email //
                const sendOTP = await otpRepo.findSentOTP(createNewOTP.id);
                const expiresat = createNewOTP.expiresat;
                return {
                    sendOTP,
                    expiresat,
                    count,
                    generateOTP
                };
            });
        }
        catch (error) {
            if (error instanceof ApiError_utils_1.default) {
                throw error;
            }
            throw new ApiError_utils_1.default(500, 'Failed to generate OTP');
        }
        try {
            await (0, send_otp_helper_utils_1.sendOtpEmailRegisteration)(email, result.generateOTP);
        }
        catch (error) {
            console.error('Failed to send OTP email:', error);
        }
        return {
            otp: result.sendOTP,
            expiresAt: result.expiresat,
            remainingAttempts: rate_limit_utils_1.RateLimit.SEND_OTP_RATE_LIMIT - result.count
        };
    }
    async sendOTPByRegisterationFlow({ phone, email }) {
        return this.sendOTP(email, phone, veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_REGISTERATION);
    }
    async sendOTPByForgotFlow({ phone, email }) {
        return this.sendOTP(email, phone, veirfy_otp_type_enum_1.VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD);
    }
}
exports.SendOTPService = SendOTPService;
exports.sendOTPService = new SendOTPService();
