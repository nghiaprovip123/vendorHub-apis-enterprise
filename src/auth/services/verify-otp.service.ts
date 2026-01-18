import ApiError from '@/common/utils/ApiError';
import { jwtService } from '@/common/jwt/index.jwt';
import { VerifyOTPType } from '@/auth/enum/veirfy-otp-type.enum'
import { IdentifierType } from '@/auth/enum/identifier-type.enum'
import sql from '@/lib/postgresQL';
type VerifyOtpInput = {
  otp: string;
  email: string;
  name?: string;
};

type VerifyOtpByRegisterationFlowResult = {
  accessToken: string;
};
type VerifyOtpByForgotFlowResult = {
  resetToken: string
}

export class VerifyOTPService {
  async verifyOtpByRegisterationFlow({
    otp,
    email,
    name,
  }: VerifyOtpInput): Promise<VerifyOtpByRegisterationFlowResult> {
    const [otpRow] = await sql`
      SELECT id
      FROM otps
      WHERE otp = ${otp}
        AND email = ${email}
        AND isverified = false
        AND isactive = true
        AND expiresat > NOW()
    `;

    if (!otpRow) {
      throw new ApiError(400, 'OTP KHÔNG HỢP LỆ');
    }

    const [existing] = await sql`
      SELECT authid
      FROM identifiers
      WHERE type = 'email'
        AND value = ${email}
        AND isactive = true
    `;

    let authUserId: string;

    if (existing?.authid) {
      authUserId = existing.authid;
    } else {
      const [{ id }] = await sql`
        INSERT INTO auth_user (name, isactive)
        VALUES (${name ?? null}, true)
        RETURNING id
      `;

      authUserId = id;

      await sql`
        INSERT INTO identifiers (
          authid,
          type,
          value,
          isverified,
          isactive
        )
        VALUES (
          ${authUserId},
          'email',
          ${email},
          true,
          true
        )
      `;
    }

    await sql`
      UPDATE otps
      SET isverified = true,
          isactive = false,
          verifiedat = NOW()
      WHERE id = ${otpRow.id}
    `;

    const accessToken = jwtService.generateAccessToken(
      {
        sub: authUserId,
        email,
        jti: jwtService.generateJit(),
      },
      300 
    );

    return { accessToken };
  }

  async verifyOtpByForgotFlow( input: VerifyOtpInput ): Promise<VerifyOtpByForgotFlowResult> {
    const { otp, email } = input

    if (!otp || !email) {
      throw new ApiError(400, 'OTP VÀ EMAIL LÀ BẮT BUỘC')
    }

    const [findOTP] = await sql`
      SELECT otp FROM otps
        WHERE otps.email = ${email}
          AND otps.otp = ${otp}
          AND otps.type = ${VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD}
          AND otps.isverified = false
          AND otps.isactive = true
    `

    if (!findOTP) {
      throw new ApiError(401, 'OTP KHÔNG HỢP LỆ')
    }

    const [findUser] = await sql`
      SELECT authid FROM identifiers
        WHERE identifiers.type = ${IdentifierType.EMAIL}
          AND identifiers.value = ${email}
    `

    if (!findUser) {
      throw new ApiError(404, 'USER NOT FOUND')
    }

    const resetToken = await jwtService.generateResetToken(
      {
        sub: findUser.authid,
        purpose: VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD
      },
      150
    )

    return { resetToken }
  }
}

export const verifyOTPService = new VerifyOTPService();
