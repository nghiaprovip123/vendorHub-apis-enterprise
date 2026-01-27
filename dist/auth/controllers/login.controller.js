"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginController = exports.LoginController = void 0;
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const login_service_1 = require("../../auth/services/login.service");
const cookie_utils_1 = require("../../common/utils/cookie.utils");
class LoginController {
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userAgent = req.headers['user-agent'] ?? 'unknown';
            if (!email || !password) {
                throw new ApiError_utils_1.default(400, 'CÁC THÔNG TIN ĐĂNG NHẬP LÀ BẮT BUỘC');
            }
            const { refreshToken } = await login_service_1.authService.login({
                email,
                password,
                userAgent,
            });
            res.cookie('refreshToken', refreshToken, cookie_utils_1.optionsCookie);
            return res.status(200).json({
                success: true,
            });
        }
        catch (err) {
            next(err);
        }
    }
}
exports.LoginController = LoginController;
exports.loginController = new LoginController();
