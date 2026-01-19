import { Request, Response, NextFunction } from "express";
import { RefreshTokenService } from "@/auth/services/refresh-token.service";
import { optionsCookie } from "@/common/utils/cookie.utils";

export const RefreshTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new Error("THIẾU REFRESH TOKEN");
    }

    const userAgent = req.headers["user-agent"] ?? null;

    const result = await RefreshTokenService.execute(
      refreshToken,
      userAgent
    );

    res.cookie("refreshToken", result.refreshToken, optionsCookie);

    return res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (err) {
    next(err);
  }
};
