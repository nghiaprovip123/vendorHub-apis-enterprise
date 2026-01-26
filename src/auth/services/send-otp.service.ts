import sql from "@/lib/postgresql"
import ApiError from "@/common/utils/ApiError.utils"
import crypto from "crypto"
import { sendOtpEmailRegisteration } from "@/common/utils/send-otp-helper.utils"
import { SendOTPSchema } from "@/auth/dto/auth/auth.validation"
import * as z from "zod"
import { VerifyOTPType } from "@/auth/enum/veirfy-otp-type.enum"
import { OTPRepository } from "@/auth/repositories/otp.repository"
import { RateLimit } from "@/common/utils/rate-limit.utils"

type SendOTPServiceType = z.infer<typeof SendOTPSchema>
type SendOTPServiceResult = {
    otp: any,
    expiresAt: Date,
    remainingAttempts: number
}

export class SendOTPService {
    private async sendOTP(
        email: string,
        phone: string,
        type: VerifyOTPType
    ): Promise<SendOTPServiceResult> {
        if (!email || !phone) {
            throw new ApiError(400, 'Email and phone are required')
        }

        let result

        try {
            result = await sql.begin(async (trx) => {
                const otpRepo = new OTPRepository(trx)

                ////////////////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: Count the OTP by email within 15 minutes //
                const count = await otpRepo.countOTPWithin15Minutes(email, type)

                if (count >= RateLimit.SEND_OTP_RATE_LIMIT) {
                    throw new ApiError(429, "KHÔNG THỂ GỬI OTP VÌ SỐ LẦN GỬI OTP ĐÃ ĐẠT GIỚI HẠN")
                }

                ////////////////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: De-Active all the old OTPs for the new process //
                await otpRepo.deactiveOldOTPs(email, phone, type)
                const generateOTP = crypto.randomInt(100000, 999999).toString()

                ////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: Create the new OTP by email //
                const createNewOTP = await otpRepo.createNewOTP(email, phone, type, generateOTP)

                /////////////////////////////////////////////////////////////////////////////////////
                // Layerize Repositories for OTP Entity: Select the OTP that is just sent by Email //
                const sendOTP = await otpRepo.findSentOTP(createNewOTP.id)
                const expiresat = await createNewOTP.expiresat
                return {
                    sendOTP,
                    expiresat,
                    count,
                    generateOTP
                }
            })
        } catch (error) {
            if (error instanceof ApiError) {
                throw error
            }
            throw new ApiError(500, 'Failed to generate OTP')
        }

        try {
            await sendOtpEmailRegisteration(email, result.generateOTP)
        } catch (error) {
            console.error('Failed to send OTP email:', error)
        }

        return {
            otp: result.sendOTP,
            expiresAt: result.expiresat,
            remainingAttempts: RateLimit.SEND_OTP_RATE_LIMIT - result.count
        }
    }

    async sendOTPByRegisterationFlow({ phone, email }: SendOTPServiceType): Promise<SendOTPServiceResult> {
        return this.sendOTP(email, phone, VerifyOTPType.VERIFY_OTP_REGISTERATION)
    }

    async sendOTPByForgotFlow({ phone, email }: SendOTPServiceType): Promise<SendOTPServiceResult> {
        return this.sendOTP(email, phone, VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD)
    }
}

export const sendOTPService = new SendOTPService()