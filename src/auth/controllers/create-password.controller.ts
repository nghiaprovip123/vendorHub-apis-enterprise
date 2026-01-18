import { Request, Response, NextFunction } from "express";
import { createPasswordService } from "@/auth/services/create-password.service";

export class CreatePasswordController {
    async createNewPasswordByRegisterationFlow (req: Request, res: Response, next: NextFunction) {
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

            const user = await createPasswordService.createPasswordByRegisterationFlow({
                token,
                password,
            });

            return res.status(200).json({
                success: true,
                return: user,
            });
        } catch (err) {
            next(err);
        }
    }
    async createPasswordByForgotFlow (req: Request, res: Response, next: NextFunction) {
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

            const user = await createPasswordService.createPasswordByForgotFlow({
                token,
                password,
            });

            return res.status(200).json({
                success: true,
                return: user,
            });
        } catch (err) {
            next(err);
        }
    }
} 

export const createPasswordController = new CreatePasswordController()