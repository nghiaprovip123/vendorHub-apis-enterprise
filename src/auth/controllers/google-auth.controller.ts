import { Request, Response, NextFunction } from "express";
import { GoogleCallbackAuthService } from "@/auth/services/google-auth.service";
import { access } from "node:fs";


export const GoogleOAuthCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ message: "MISSING AUTHORIZATION CODE" });
    }

    const userAgent = req.headers["user-agent"] ?? null;

    const { accessToken, refreshToken } =
      await GoogleCallbackAuthService.execute({
        code,
        userAgent,
      });

    // ✅ FIX: Truyền tokens qua URL params để FE tự set cookie
    // Dùng encodeURIComponent để encode special characters trong token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const redirectUrl = `${frontendUrl}/auth/callback?accessToken=${encodeURIComponent(accessToken)}&refreshToken=${encodeURIComponent(refreshToken)}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    next(err);
  }
};
