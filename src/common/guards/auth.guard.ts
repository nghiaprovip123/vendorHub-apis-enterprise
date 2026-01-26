import { jwtService } from "@/common/jwt/index.jwt"
import { Request, Response, NextFunction } from "express"
import { GuardError } from "@/common/utils/error/guard.error"
declare global { 
    namespace Express { 
        interface Request { 
            user?: string | any 
        } 
    } 
}
export class AuthGuard {
    static RequireAuth ( req: Request, res: Response, next: NextFunction ) {
        try {
            const authHeader = req.headers.authorization

            if (!authHeader) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.MISSING_AUTHENTICATION_ERROR
                    }
                )
            }
    
            const token = authHeader.split(" ")[1]
    
            if (!token) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.MISSING_TOKEN_ERROR
                    }
                )
            }
    
            const decoded = jwtService.verifyAccessToken(token)
    
            if (!decoded) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.WRONG_ACCESS_TOKEN_INFORMATION
                    }
                )        
            }
            
            req.user = decoded
            next()
        }
        catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: GuardError.TOKEN_IS_EXPIRED
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'FAIL TO AUTHENTICATE'
            });
        } 
    }

    static RequireRefreshToken ( req: Request, res: Response, next: NextFunction ) {
        try {
            const refreshToken = req.cookies?.refreshToken

            if (!refreshToken) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.MISSING_REFRESH_TOKEN_ERROR
                    }
                )
            }
    
            const decoded = jwtService.verifyRefreshToken(refreshToken)
    
            if (!decoded) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.WRONG_REFRESH_TOKEN_INFORMATION
                    }
                )
            }
            
            req.user = decoded
            next()
        }
        catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: GuardError.WRONG_REFRESH_TOKEN_INFORMATION
                });
            }
            
            return res.status(401).json({
                success: false,
                message: 'FAIL TO AUTHENTICATE'
            });
        }

    }

    static RequireResetToken ( req: Request, res: Response, next: NextFunction ) {
        try {
            const authHeader = req.headers.authorization

            if (!authHeader) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.MISSING_AUTHENTICATION_ERROR
                    }
                )
            }
    
            const token = authHeader.split(" ")[1]
    
            if (!token) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.MISSING_RESET_TOKEN_INFORMATION
                    }
                )
            }
    
            const decoded = jwtService.verifyResetToken(token)
    
            if (!decoded) {
                return res.status(401).json(
                    {
                        success: false,
                        message: GuardError.WRONG_RESET_TOKEN_INFORMATION
                    }
                )
            }
    
            req.user = decoded
    
            next()
        }
    catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: GuardError.WRONG_RESET_TOKEN_INFORMATION
            });
        }
        
        return res.status(401).json({
            success: false,
            message: 'FAIL TO AUTHENTICATE'
        });
    }
}
}