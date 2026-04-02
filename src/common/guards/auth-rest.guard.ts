// auth.middleware.ts
import { Request, Response, NextFunction } from "express"
import { AuthGuard } from "@/common/guards/auth-core.guard"

export class requireAuth {
    static accessToken (
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const authHeader = req.headers.authorization || ""
            const token = authHeader.split(" ")[1]
            const user = AuthGuard.verifyAccessToken(token)
            req.user = user
            next()
        }
        catch (error: any) {
            return res.status(401).json(
                {
                    success: false,
                    message: error.message
                }
            )
        }
    }

    static refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies?.refreshToken  // ← read from cookie, not header
            const user = AuthGuard.verifyRefreshToken(refreshToken)
            req.user = user
            next()
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                message: error.message
            })
        }
    }
    static resetToken (
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        try {
            const authHeader = req.headers.authorization || ""
            const token = authHeader.split(" ")[1]
            const user = AuthGuard.verifyResetToken(token)
            req.user = user
            next()
        }
        catch (error: any) {
            return res.status(401).json(
                {
                    success: false,
                    message: error.message
                }
            )
        }
    }
}

