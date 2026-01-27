"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOTPController = exports.SendOTPController = void 0;
const send_otp_service_1 = require("../../auth/services/send-otp.service");
class SendOTPController {
    async SendOTPByRegisterationFlow(req, res, next) {
        try {
            const { phone, email } = req.body;
            const result = await send_otp_service_1.sendOTPService.sendOTPByRegisterationFlow({ phone, email });
            return res.json({
                success: true,
                otp: result.otp,
                expiresAt: result.expiresAt,
                remaining: result.remainingAttempts
            });
        }
        catch (err) {
            next(err);
        }
    }
    async SendOTPByForgotFlow(req, res, next) {
        try {
            const { phone, email } = req.body;
            const result = await send_otp_service_1.sendOTPService.sendOTPByForgotFlow({ phone, email });
            return res.json({
                success: true,
                otp: result.otp,
                expiresAt: result.expiresAt,
                remaining: result.remainingAttempts
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SendOTPController = SendOTPController;
exports.sendOTPController = new SendOTPController();
