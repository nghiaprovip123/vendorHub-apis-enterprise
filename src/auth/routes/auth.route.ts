import express from "express"
import { LoginController } from "@/auth/controllers/login.controller"
import { SendOTPController } from "@/auth/controllers/send-otp.controller"
import { VerifyOTPController } from "@/auth/controllers/verify-otp.controller"
import { CreatePasswordController } from "@/auth/controllers/create-password.controller"
const AuthRouter = express.Router()

AuthRouter.post('/login', LoginController)
AuthRouter.post('/sendOTP', SendOTPController)
AuthRouter.post('/verifyOTP', VerifyOTPController)
AuthRouter.post('/createPassword', CreatePasswordController)

export default AuthRouter
