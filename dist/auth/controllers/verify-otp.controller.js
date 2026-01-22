"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOTPController = exports.VerifyOTPController = void 0;
const ApiError_utils_1 = __importDefault(require("@/common/utils/ApiError.utils"));
const verify_otp_service_1 = require("@/auth/services/verify-otp.service");
class VerifyOTPController {
    async verifyOTPByRegisterationFlow(req, res, next) {
        try {
            const { otp, email, name } = req.body;
            if (!otp || !email) {
                throw new ApiError_utils_1.default(400, 'OTP VÀ EMAIL LÀ BẮT BUỘC');
            }
            const { accessToken } = await verify_otp_service_1.verifyOTPService.verifyOtpByRegisterationFlow({
                otp,
                email,
                name,
            });
            return res.json({
                success: true,
                accessToken,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async verifyOTPByForgotFlow(req, res, next) {
        try {
            const result = await verify_otp_service_1.verifyOTPService.verifyOtpByForgotFlow({
                otp: req.body.otp,
                email: req.body.email
            });
            return res.json({
                success: true,
                resetToken: result.resetToken
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.VerifyOTPController = VerifyOTPController;
exports.verifyOTPController = new VerifyOTPController();
