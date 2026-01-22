"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtilities = void 0;
const argon2_1 = __importDefault(require("argon2"));
class PasswordUtilities {
    static async hashPassword(password) {
        return argon2_1.default.hash(password);
    }
    static async comparePassword(hashPassword, password) {
        return argon2_1.default.verify(hashPassword, password);
    }
}
exports.PasswordUtilities = PasswordUtilities;
