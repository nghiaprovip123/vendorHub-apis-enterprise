"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const index_jwt_1 = require("@/common/jwt/index.jwt");
const guard_error_1 = require("@/common/utils/error/guard.error");
class AuthGuard {
    static verifyAccessToken(token) {
        if (!token) {
            throw new Error(guard_error_1.GuardError.MISSING_ACCESS_TOKEN_ERROR);
        }
        const decoded = index_jwt_1.jwtService.verifyAccessToken(token);
        if (!decoded) {
            throw new Error(guard_error_1.GuardError.WRONG_REFRESH_TOKEN_INFORMATION);
        }
        return decoded;
    }
    static verifyRefreshToken(token) {
        if (!token) {
            throw new Error(guard_error_1.GuardError.MISSING_REFRESH_TOKEN_ERROR);
        }
        const decoded = index_jwt_1.jwtService.verifyRefreshToken(token);
        if (!decoded) {
            throw new Error(guard_error_1.GuardError.WRONG_REFRESH_TOKEN_INFORMATION);
        }
        return decoded;
    }
    // static RequireRefreshToken ( req: Request, res: Response, next: NextFunction ) {
    //     try {
    //         const refreshToken = req.cookies?.refreshToken
    //         if (!refreshToken) {
    //             return res.status(401).json(
    //                 {
    //                     success: false,
    //                     message: GuardError.MISSING_REFRESH_TOKEN_ERROR
    //                 }
    //             )
    //         }
    //         const decoded = jwtService.verifyRefreshToken(refreshToken)
    //         if (!decoded) {
    //             return res.status(401).json(
    //                 {
    //                     success: false,
    //                     message: GuardError.WRONG_REFRESH_TOKEN_INFORMATION
    //                 }
    //             )
    //         }
    //         req.user = decoded
    //         next()
    //     }
    //     catch (error: any) {
    //         if (error.name === 'TokenExpiredError') {
    //             return res.status(401).json({
    //                 success: false,
    //                 message: GuardError.WRONG_REFRESH_TOKEN_INFORMATION
    //             });
    //         }
    //         return res.status(401).json({
    //             success: false,
    //             message: 'FAIL TO AUTHENTICATE'
    //         });
    //     }
    // }
    static verifyResetToken(resetToken) {
        if (!resetToken) {
            throw new Error(guard_error_1.GuardError.MISSING_RESET_TOKEN_INFORMATION);
        }
        const decoded = index_jwt_1.jwtService.verifyResetToken(resetToken);
        if (!decoded) {
            throw new Error(guard_error_1.GuardError.WRONG_RESET_TOKEN_INFORMATION);
        }
        return decoded;
    }
}
exports.AuthGuard = AuthGuard;
