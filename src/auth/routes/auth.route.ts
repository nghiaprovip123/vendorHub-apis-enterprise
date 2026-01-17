import express from "express"
import { loginController } from "@/auth/controllers/login.controller"
import { sendOTPController } from "@/auth/controllers/send-otp.controller"
import { verifyOTPController } from "@/auth/controllers/verify-otp.controller"
import { createPasswordController } from "@/auth/controllers/create-password.controller"
const AuthRouter = express.Router()

AuthRouter.post('/login', loginController.LoginController)
AuthRouter.post('/sendOTP', sendOTPController.SendOTPController)
AuthRouter.post('/verifyOTP', verifyOTPController.VerifyOTPController)
AuthRouter.post('/createPassword', createPasswordController.CreatePassword)

export default AuthRouter
