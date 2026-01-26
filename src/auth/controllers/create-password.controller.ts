// auth/controllers/create-password.controller.ts
import { Request, Response, NextFunction } from "express";
import { createPasswordService } from "@/auth/services/create-password.service";

export class CreatePasswordController {
    async createNewPasswordByRegisterationFlow(
        req: Request, 
        res: Response, 
        next: NextFunction
    ) {
        try {
            const { password } = req.body;
            
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "THIẾU THÔNG TIN PASSWORD",
                });
            }

            const userId = req.user?.sub || req.user?.userId;

            const user = await createPasswordService.createPasswordByRegisterationFlow({
                userId,
                password,
            });

            return res.status(200).json({
                success: true,
                message: "TẠO MẬT KHẨU THÀNH CÔNG",
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }

    async createPasswordByForgotFlow(
        req: Request, 
        res: Response, 
        next: NextFunction
    ) {
        try {
            const { password } = req.body;
            
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "THIẾU THÔNG TIN PASSWORD",
                });
            }

            const extractedUser = req.user

            const user = await createPasswordService.createPasswordByForgotFlow({
                extractedUser,
                password,
            });

            return res.status(200).json({
                success: true,
                message: "ĐẶT LẠI MẬT KHẨU THÀNH CÔNG",
                data: user,
            });
        } catch (err) {
            next(err);
        }
    }
}

export const createPasswordController = new CreatePasswordController();