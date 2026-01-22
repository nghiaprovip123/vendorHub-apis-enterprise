"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const index_jwt_1 = require("@/common/jwt/index.jwt");
class AuthGuard {
    constructor(token) {
        this.token = token;
        if (!token) {
            throw new Error("THIẾU THÔNG TIN TOKEN");
        }
    }
    verifyToken() {
        const decoded = index_jwt_1.jwtService.verifyAccessToken(this.token);
        if (!decoded) {
            throw new Error('SAI TOKEN, VUI LÒNG THỬ LẠI');
        }
        return decoded;
    }
    extractTokenPayload() {
        const payload = this.verifyToken();
        if (!payload) {
            throw new Error("KHÔNG TỒN TẠI TOKEN PAYLOAD");
        }
        return payload;
    }
    verifyRefreshToken() {
        const decoded = index_jwt_1.jwtService.verifyRefreshToken(this.token);
        if (!decoded) {
            throw new Error('SAI TOKEN, VUI LÒNG THỬ LẠI');
        }
        return decoded;
    }
    extractAccessTokenPayload() {
        const payload = this.verifyRefreshToken();
        if (!payload) {
            throw new Error("KHÔNG TỒN TẠI TOKEN PAYLOAD");
        }
        return payload;
    }
}
exports.AuthGuard = AuthGuard;
