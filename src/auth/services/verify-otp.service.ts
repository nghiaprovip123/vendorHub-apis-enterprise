import sql from "@/lib/postgresql"
import ApiError from "@/common/utils/ApiError"
import { jwtService } from "@/common/jwt/index.jwt"
import { VerifyOTPType } from "@/auth/enum/veirfy-otp-type.enum"
import { IdentifierType } from "@/auth/enum/identifier-type.enum"

type VerifyOtpInput = {
    otp: string
    email: string
    name?: string
}

type VerifyOtpByRegisterationFlowResult = {
    accessToken: string
}

type VerifyOtpByForgotFlowResult = {
    resetToken: string
}

export class VerifyOTPService {
  async verifyOtpByRegisterationFlow({
    otp,
    email,
    name,
  }: VerifyOtpInput): Promise<VerifyOtpByRegisterationFlowResult> {
    
    const result = await sql.begin(async (tx) => {
      const [otpRow] = await tx`
        SELECT id
        FROM otps
        WHERE otp = ${otp}
          AND email = ${email}
          AND type = ${VerifyOTPType.VERIFY_OTP_REGISTERATION}
          AND isverified = false
          AND isactive = true
          AND expiresat > NOW()
      `

      if (!otpRow) {
        throw new ApiError(400, 'OTP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN')
      }

      const [existing] = await tx`
        SELECT authid
        FROM identifiers
        WHERE type = ${IdentifierType.EMAIL}
          AND value = ${email}
          AND isactive = true
      `

      let authUserId: string

      if (existing?.authid) {
        authUserId = existing.authid
      } else {
        const [{ id }] = await tx`
          INSERT INTO auth_user (name, isactive)
          VALUES (${name ?? null}, true)
          RETURNING id
        `
        authUserId = id

        await tx`
          INSERT INTO identifiers (
            authid,
            type,
            value,
            isverified,
            isactive
          )
          VALUES (
            ${authUserId},
            ${IdentifierType.EMAIL},
            ${email},
            true,
            true
          )
        `
      }

      await tx`
        UPDATE otps
        SET isverified = true,
            isactive = false,
            verifiedat = NOW()
        WHERE id = ${otpRow.id}
      `
      return {
        authUserId,
        email
      }
    }) 

    const accessToken = jwtService.generateAccessToken(
      {
        sub: result.authUserId,
        email: result.email,
        jti: jwtService.generateJit(),
      },
      300
    )

    return { accessToken }
  }

  async verifyOtpByForgotFlow(input: VerifyOtpInput): Promise<VerifyOtpByForgotFlowResult> {
    const { otp, email } = input

    if (!otp || !email) {
      throw new ApiError(400, 'OTP VÀ EMAIL LÀ BẮT BUỘC')
    }

    const result = await sql.begin(async (tx) => {
      const [otpRow] = await tx`
        SELECT id
        FROM otps
        WHERE email = ${email}
          AND otp = ${otp}
          AND type = ${VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD}
          AND isverified = false
          AND isactive = true
          AND expiresat > NOW()
      `

      if (!otpRow) {
        throw new ApiError(401, 'OTP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN')
      }

      const [findUser] = await tx`
        SELECT authid
        FROM identifiers
        WHERE type = ${IdentifierType.EMAIL}
          AND value = ${email}
          AND isactive = true
      `

      if (!findUser) {
        throw new ApiError(404, 'NGƯỜI DÙNG KHÔNG TỒN TẠI')
      }

      await tx`
        UPDATE otps
        SET isverified = true,
            isactive = false,
            verifiedat = NOW()
        WHERE id = ${otpRow.id}
      `

      return {
        authUserId: findUser.authid
      }
    })

    const resetToken = jwtService.generateResetToken(
      {
        sub: result.authUserId,
        purpose: VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD,
        jti: jwtService.generateJit()
      },
      150
    )

    return { resetToken }
  }
}

export const verifyOTPService = new VerifyOTPService()