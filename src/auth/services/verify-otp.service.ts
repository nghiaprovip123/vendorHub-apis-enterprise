import sql from "@/lib/postgresQL"
import ApiError from "@/common/utils/ApiError.utils"
import { jwtService } from "@/common/jwt/index.jwt"
import { VerifyOTPType } from "@/auth/enum/verify-otp-type.enum"
import { IdentifierType } from "@/auth/enum/identifier-type.enum"
import { OTPRepository } from '@/auth/repositories/otp.repository'
import { IdentifiersRepository } from '@/auth/repositories/identifiers.repository'
import { AuthenticationUserRepository } from '@/auth/repositories/auth-user.repository'
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
          const otpRepo = new OTPRepository(tx)
          const identifiersRepo = new IdentifiersRepository(tx)
          const authenticationUserRepository = new AuthenticationUserRepository(tx)
          
          const otpRow = await otpRepo.findOTPForVerification(otp, email, VerifyOTPType.VERIFY_OTP_REGISTERATION)
          
          if (!otpRow) {
              throw new ApiError(400, 'OTP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN')
          }

          const existing = await identifiersRepo.checkExistenceOfIdentifier(
              IdentifierType.EMAIL, 
              email
          )

          let authUserId: string

          if (existing?.authid) {
              authUserId = existing.authid
          } else {
              const createAuthUser = await authenticationUserRepository.createNewAuthenticationUser(name)
              authUserId = createAuthUser.id
              await identifiersRepo.insertIdentifiers(
                  authUserId, 
                  IdentifierType.EMAIL, 
                  email
              )
          }

          await otpRepo.setOTPAsVerified(otpRow.id)
          
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
      const otpRepo = new OTPRepository(tx)
      const identifiersRepo = new IdentifiersRepository(tx)
      const otpRow = await otpRepo.findOTPForVerification(otp, email, VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD)

      if (!otpRow) {
        throw new ApiError(401, 'OTP KHÔNG HỢP LỆ HOẶC ĐÃ HẾT HẠN')
      }

      const findUser = await identifiersRepo.checkExistenceOfIdentifier(
        IdentifierType.EMAIL, 
        email
    )

      if (!findUser) {
        throw new ApiError(404, 'NGƯỜI DÙNG KHÔNG TỒN TẠI')
      }

      await otpRepo.setOTPAsVerified(otpRow.id)

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