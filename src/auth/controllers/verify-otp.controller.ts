import { Request, Response, NextFunction } from 'express';
import ApiError from '@/common/utils/ApiError';
import { verifyOTPService } from '@/auth/services/verify-otp.service';

export class VerifyOTPController {
  async verifyOTPByRegisterationFlow ( req: Request, res: Response, next: NextFunction ) {
    try {
      const { otp, email, name } = req.body;

      if (!otp || !email) {
        throw new ApiError(400, 'OTP VÀ EMAIL LÀ BẮT BUỘC');
      }

      const { accessToken } = await verifyOTPService.verifyOtpByRegisterationFlow({
        otp,
        email,
        name,
      });

      return res.json({
        success: true,
        accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async verifyOTPByForgotFlow ( req: Request, res: Response, next: NextFunction ) {
    try {
      const result = await verifyOTPService.verifyOtpByForgotFlow({
        otp: req.body.otp,
        email: req.body.email
      })

      return res.json({
        success: true,
        resetToken: result.resetToken
      })
    } catch (err) {
      next(err)
    }
  }
}

export const verifyOTPController = new VerifyOTPController();

