import sql from "@/lib/postgresql"
import ApiError from "@/common/utils/ApiError.utils"
import crypto from "crypto"
import { sendOtpEmailRegisteration } from "@/common/utils/send-otp-helper.utils"
import { SendOTPSchema } from "@/auth/dto/auth/auth.validation"
import * as z from "zod"
import { VerifyOTPType } from "@/auth/enum/veirfy-otp-type.enum"

type SendOTPServiceType = z.infer<typeof SendOTPSchema>
type SendOTPServiceResult = {
    otp: any,
    expiresAt: string,
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
            result = await sql.begin(async (sql) => {
                const [{ count }] = await sql`
                    SELECT COUNT(*)::int AS count 
                    FROM otps
                    WHERE type = ${type}
                        AND email = ${email}
                        AND createdat > NOW() - INTERVAL '15 minutes'
                `

                if (count >= 3) {
                    throw new ApiError(429, "KHÔNG THỂ GỬI OTP VÌ SỐ LẦN GỬI OTP ĐÃ ĐẠT GIỚI HẠN")
                }

                // Deactivate old OTPs
                await sql`
                    UPDATE otps
                    SET isverified = true,
                        isactive = false
                    WHERE type = ${type}
                        AND email = ${email}
                        AND phone = ${phone}
                        AND isverified = false
                        AND isactive = true
                `

                const generateOTP = crypto.randomInt(100000, 999999).toString()

                const [{ expiresat, id }] = await sql`
                    INSERT INTO otps (
                        type, email, otp, expiresat, phone
                    ) VALUES (
                        ${type}, ${email}, ${generateOTP},
                        NOW() + INTERVAL '15 Minutes', ${phone}
                    )
                    RETURNING expiresat, id
                `

                const [sendOTP] = await sql`
                    SELECT * FROM otps WHERE id = ${id}
                `

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
            remainingAttempts: 3 - result.count
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