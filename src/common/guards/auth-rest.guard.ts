// auth.middleware.ts
import { Request, Response, NextFunction } from "express"
import { AuthGuard } from "@/common/guards/auth-core.guard"

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization || ""
    const token = authHeader.split(" ")[1]

    const user = AuthGuard.verifyAccessToken({token})

    req.user = user
    next()
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: error.message
    })
  }
}