"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_controller_1 = require("@/auth/controllers/login.controller");
const send_otp_controller_1 = require("@/auth/controllers/send-otp.controller");
const verify_otp_controller_1 = require("@/auth/controllers/verify-otp.controller");
const create_password_controller_1 = require("@/auth/controllers/create-password.controller");
const refresh_token_controller_1 = require("@/auth/controllers/refresh-token.controller");
const sign_out_controller_1 = require("@/auth/controllers/sign-out.controller");
const google_redirect_controller_1 = require("@/auth/controllers/google-redirect.controller");
const google_auth_controller_1 = require("@/auth/controllers/google-auth.controller");
const auth_rest_guard_1 = require("@/common/guards/auth-rest.guard");
const AuthRouter = express_1.default.Router();
// REDIRECT USER QUA GOOGLE
AuthRouter.get('/google', google_redirect_controller_1.GoogleRedirectController);
// GOOGLE CALLBACK ĐỂ EXCHANGE TOKEN
AuthRouter.get('/callback/google', google_auth_controller_1.GoogleOAuthCallbackController);
// ĐĂNG NHẬP
AuthRouter.post('/login', login_controller_1.loginController.login);
// ĐĂNG XUẤT
AuthRouter.get('/logout', auth_rest_guard_1.requireAuth.refreshToken, sign_out_controller_1.SignOutController);
// ĐĂNG KÝ
AuthRouter.post('/registeration/sendOTP', send_otp_controller_1.sendOTPController.SendOTPByRegisterationFlow);
AuthRouter.post('/registeration/verifyOTP', verify_otp_controller_1.verifyOTPController.verifyOTPByRegisterationFlow);
AuthRouter.post('/registeration/createPassword', auth_rest_guard_1.requireAuth.accessToken, create_password_controller_1.createPasswordController.createNewPasswordByRegisterationFlow);
// QUÊN MẬT KHẨU
AuthRouter.post('/forgot-password/sendOTP', send_otp_controller_1.sendOTPController.SendOTPByForgotFlow);
AuthRouter.post('/forgot-password/verifyOTP', verify_otp_controller_1.verifyOTPController.verifyOTPByForgotFlow);
AuthRouter.post('/forgot-password/createPassword', auth_rest_guard_1.requireAuth.resetToken, create_password_controller_1.createPasswordController.createPasswordByForgotFlow);
// REFRESH TOKEN
AuthRouter.post('/refresh-tokens', auth_rest_guard_1.requireAuth.refreshToken, refresh_token_controller_1.RefreshTokenController);
exports.default = AuthRouter;
