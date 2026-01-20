import { Request, Response, NextFunction } from "express";
import { optionsCookie } from "@/common/utils/cookie.utils";
import { GoogleCallbackAuthService } from "@/auth/services/google-auth.service";


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

    res.cookie("refreshToken", refreshToken, optionsCookie);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};
