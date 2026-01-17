import express from "express"
import { loginController } from "@/auth/controllers/login.controller"
import { sendOTPController } from "@/auth/controllers/send-otp.controller"
import { verifyOTPController } from "@/auth/controllers/verify-otp.controller"
import { createPasswordController } from "@/auth/controllers/create-password.controller"
const AuthRouter = express.Router()

AuthRouter.post('/login', loginController.LoginController)
AuthRouter.post('/sendOTPRegisteration', sendOTPController.SendOTPByRegisterationFlow)
AuthRouter.post('/sendOTPForgotPassword', sendOTPController.SendOTPByForgotFlow)
AuthRouter.post('/verifyOTPRegisteration', verifyOTPController.verifyOTPByRegisterationFlow)
AuthRouter.post('/verifyOTPForgotPassword', verifyOTPController.verifyOTPByForgotFlow)
AuthRouter.post('/createPasswordRegisteration', createPasswordController.createNewPasswordByRegisterationFlow)
// AuthRouter.post('/')

export default AuthRouter
