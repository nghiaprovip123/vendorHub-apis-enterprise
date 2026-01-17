import { Request, Response, NextFunction } from 'express';
import ApiError from '@/common/utils/ApiError';
import { otpAuthService } from '@/auth/services/verify-otp.service';

export class VerifyOTPController {
  async VerifyOTPController ( req: Request, res: Response, next: NextFunction ) {
    try {
      const { otp, email, name } = req.body;

      if (!otp || !email) {
        throw new ApiError(400, 'OTP VÀ EMAIL LÀ BẮT BUỘC');
      }

      const { accessToken } = await otpAuthService.verifyOtp({
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
}

export const verifyOTPController = new VerifyOTPController();

