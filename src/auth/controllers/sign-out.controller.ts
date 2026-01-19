import { Request, Response, NextFunction } from "express"
import { SignOutService } from "@/auth/services/sign-out.service"
import { optionsRevokedCookie } from "@/common/utils/cookie.utils"

export const SignOutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.clearCookie("refreshToken", optionsRevokedCookie);
      return res.status(200).json({ success: true });
    }

    const service = new SignOutService();
    await service.execute(refreshToken);

    res.clearCookie("refreshToken", optionsRevokedCookie);

    return res.status(200).json({
      success: true,
      message: "ĐĂNG XUẤT THÀNH CÔNG",
    });
  } catch (err) {
    next(err);
  }
};
