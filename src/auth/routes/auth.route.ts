import express from "express"
import { loginController } from "@/auth/controllers/login.controller"
import { sendOTPController } from "@/auth/controllers/send-otp.controller"
import { verifyOTPController } from "@/auth/controllers/verify-otp.controller"
import { createPasswordController } from "@/auth/controllers/create-password.controller"
const AuthRouter = express.Router()


// ĐĂNG NHẬP
AuthRouter.post('/login', loginController.login)

// ĐĂNG KÝ
AuthRouter.post('/registeration/sendOTP', sendOTPController.SendOTPByRegisterationFlow)
AuthRouter.post('/registeration/verifyOTP', verifyOTPController.verifyOTPByRegisterationFlow)
AuthRouter.post('/registeration/createPassword', createPasswordController.createNewPasswordByRegisterationFlow)

// QUÊN MẬT KHẨU
AuthRouter.post('/forgot-password/sendOTP', sendOTPController.SendOTPByForgotFlow)
AuthRouter.post('forgot-password/verifyOTP', verifyOTPController.verifyOTPByForgotFlow)
AuthRouter.post('/forgot-password/createPassword', createPasswordController.createPasswordByForgotFlow)


export default AuthRouter
