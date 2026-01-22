"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
class JwtService {
    constructor({ publicKey, privateKey, algorithm = "RS256" }) {
        if (!publicKey || !privateKey) {
            throw new Error("JWTs must be provide");
        }
        ;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.algorithm = algorithm;
    }
    generateAccessToken(payload, expiresInSecond) {
        const options = {
            algorithm: this.algorithm,
            expiresIn: expiresInSecond || 300
        };
        return jsonwebtoken_1.default.sign(payload, this.privateKey, options);
    }
    verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.publicKey, { algorithms: [this.algorithm] });
    }
    generateRefreshToken(payload, expiresInSecond) {
        const options = {
            algorithm: this.algorithm,
            expiresIn: expiresInSecond || 604800
        };
        return jsonwebtoken_1.default.sign(payload, this.privateKey, options);
    }
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.publicKey, { algorithms: [this.algorithm] });
    }
    generateResetToken(payload, expiresInSecond) {
        const options = {
            algorithm: this.algorithm,
            expiresIn: expiresInSecond || 150,
        };
        return jsonwebtoken_1.default.sign(payload, this.privateKey, options);
    }
    verifyResetToken(token) {
        return jsonwebtoken_1.default.verify(token, this.publicKey, { algorithms: [this.algorithm] });
    }
    generateJit() {
        return crypto_1.default.randomUUID();
    }
}
exports.JwtService = JwtService;
//     generateAccessToken(payload: Record<string, any>, expiresInSeconds?: number): string {
//         const options: SignOptions = {
//             algorithm: this.algorithm,
//             expiresIn: expiresInSeconds || 300,
//         }
//         return jwt.sign(payload, this.privateKey, options)
//     }
//     verifyAccessToken(token: string): any {
//         return jwt.verify(token, this.publicKey, { algorithms: [this.algorithm] });
//     }
//     generateJit(): string {
//         return crypto.randomUUID();
//     }
// }
