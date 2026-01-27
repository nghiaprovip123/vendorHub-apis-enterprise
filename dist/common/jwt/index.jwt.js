"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jwt_service_1 = require("../../common/jwt/jwt.service");
exports.jwtService = new jwt_service_1.JwtService({
    privateKey: process.env.JWT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    publicKey: process.env.JWT_PUBLIC_KEY.replace(/\\n/g, "\n"),
    algorithm: "RS256",
});
