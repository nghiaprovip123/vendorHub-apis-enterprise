import express from "express"
import { loginController } from "@/auth/controllers/login.controller"
import { sendOTPController } from "@/auth/controllers/send-otp.controller"
import { verifyOTPController } from "@/auth/controllers/verify-otp.controller"
import { createPasswordController } from "@/auth/controllers/create-password.controller"
import { RefreshTokenController } from "@/auth/controllers/refresh-token.controller"
import { SignOutController } from "@/auth/controllers/sign-out.controller"
import { GoogleRedirectController } from '@/auth/controllers/google-redirect.controller'
import { GoogleOAuthCallbackController } from '@/auth/controllers/google-auth.controller'
import { requireAuth } from '@/common/guards/auth-rest.guard'
const AuthRouter = express.Router()

// REDIRECT USER QUA GOOGLE
AuthRouter.get('/google', GoogleRedirectController);

// GOOGLE CALLBACK ĐỂ EXCHANGE TOKEN
AuthRouter.get('/callback/google', GoogleOAuthCallbackController);

// ĐĂNG NHẬP
AuthRouter.post('/login', loginController.login)

// ĐĂNG XUẤT
AuthRouter.get('/logout', requireAuth.refreshToken, SignOutController)

// ĐĂNG KÝ
AuthRouter.post('/registeration/sendOTP', sendOTPController.SendOTPByRegisterationFlow)
AuthRouter.post('/registeration/verifyOTP', verifyOTPController.verifyOTPByRegisterationFlow)
AuthRouter.post('/registeration/createPassword', requireAuth.accessToken, createPasswordController.createNewPasswordByRegisterationFlow)

// QUÊN MẬT KHẨU
AuthRouter.post('/forgot-password/sendOTP', sendOTPController.SendOTPByForgotFlow)
AuthRouter.post('/forgot-password/verifyOTP', verifyOTPController.verifyOTPByForgotFlow)
AuthRouter.post('/forgot-password/createPassword', requireAuth.resetToken,createPasswordController.createPasswordByForgotFlow)

// REFRESH TOKEN
AuthRouter.post('/refresh-tokens', requireAuth.refreshToken, RefreshTokenController)

export default AuthRouter
