import { Request, Response, NextFunction } from 'express';
import ApiError from '@/common/utils/ApiError.utils';
import { authService } from '@/auth/services/login.service';
import { optionsCookie } from '@/common/utils/cookie.utils';


export class LoginController {
  async login ( req: Request, res: Response, next: NextFunction ) {
    try {
      const { email, password } = req.body;
      const userAgent = req.headers['user-agent'] ?? 'unknown';

      if (!email || !password) {
        throw new ApiError(400, 'CÁC THÔNG TIN ĐĂNG NHẬP LÀ BẮT BUỘC');
      }

      const { refreshToken } = await authService.login({
        email,
        password,
        userAgent,
      });

      console.log(refreshToken)

      res.cookie('refreshToken', refreshToken, optionsCookie);

      return res.status(200).json({
        success: true,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const loginController = new LoginController()