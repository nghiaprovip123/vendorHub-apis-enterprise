"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPasswordController = exports.CreatePasswordController = void 0;
const create_password_service_1 = require("@/auth/services/create-password.service");
class CreatePasswordController {
    async createNewPasswordByRegisterationFlow(req, res, next) {
        try {
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "THIẾU THÔNG TIN PASSWORD",
                });
            }
            const userId = req.user?.sub || req.user?.userId;
            const user = await create_password_service_1.createPasswordService.createPasswordByRegisterationFlow({
                userId,
                password,
            });
            return res.status(200).json({
                success: true,
                message: "TẠO MẬT KHẨU THÀNH CÔNG",
                data: user,
            });
        }
        catch (err) {
            next(err);
        }
    }
    async createPasswordByForgotFlow(req, res, next) {
        try {
            const { password } = req.body;
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "THIẾU THÔNG TIN PASSWORD",
                });
            }
            const extractedUser = req.user;
            const user = await create_password_service_1.createPasswordService.createPasswordByForgotFlow({
                extractedUser,
                password,
            });
            return res.status(200).json({
                success: true,
                message: "ĐẶT LẠI MẬT KHẨU THÀNH CÔNG",
                data: user,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CreatePasswordController = CreatePasswordController;
exports.createPasswordController = new CreatePasswordController();
