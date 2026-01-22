"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordController = exports.CreatePasswordController = void 0;
const create_password_service_1 = require("@/auth/services/create-password.service");
class CreatePasswordController {
    async createNewPasswordByRegisterationFlow(req, res, next) {
        try {
            const { password } = req.body ?? {};
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "THIẾU THÔNG TIN PASSWORD",
                });
            }
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: "THIẾU THÔNG TIN HEADER AUTHORIZATION",
                });
            }
            const token = authHeader.split(" ")[1];
            const user = await create_password_service_1.createPasswordService.createPasswordByRegisterationFlow({
                token,
                password,
            });
            return res.status(200).json({
                success: true,
                return: user,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async createPasswordByForgotFlow(req, res, next) {
        try {
            const { password } = req.body ?? {};
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "THIẾU THÔNG TIN PASSWORD",
                });
            }
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: "THIẾU THÔNG TIN HEADER AUTHORIZATION",
                });
            }
            const token = authHeader.split(" ")[1];
            const user = await create_password_service_1.createPasswordService.createPasswordByForgotFlow({
                token,
                password,
            });
            return res.status(200).json({
                success: true,
                return: user,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CreatePasswordController = CreatePasswordController;
exports.createPasswordController = new CreatePasswordController();
