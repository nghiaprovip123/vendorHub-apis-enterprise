import sql from "@/lib/postgresql";
import argon2 from "argon2";
import { jwtService } from "@/common/jwt/index.jwt";
import { GoogleOpenAuthorizationService } from "@/auth/services/google-oauth.service";
import { RefreshTokenSessionRepository } from '@/auth/repositories/refresh-token-sessions.repository'
import { IdentifiersRepository } from "@/auth/repositories/identifiers.repository";
import { IdentifierType } from '@/auth/enum/identifier-type.enum'
export class GoogleCallbackAuthService {
    static async execute(params: {
    code: string;
    userAgent: string | null
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const { code, userAgent } = params;
    
    const refreshTokenSessionRepo = new RefreshTokenSessionRepository(sql)

    const tokenData =
      await GoogleOpenAuthorizationService.exchangeGoogleTokens({ code });

    const googleAccessToken = tokenData.access_token;

    const googleUser =
      await GoogleOpenAuthorizationService.fetchUserInfo({
        access_token: googleAccessToken,
      });

    if (!googleUser.email) {
      throw new Error("GOOGLE_ACCOUNT_HAS_NO_EMAIL");
    }

    const email = googleUser.email;

    const authId = await this.resolveAuthUser(email, userAgent);

    const refreshToken = await jwtService.generateRefreshToken(
      {
        sub: authId,
        email,
        jti: jwtService.generateJit(),
      },
      60 * 60 * 24 * 7
    );

    const refreshTokenHash = await argon2.hash(refreshToken);

    await refreshTokenSessionRepo.createRefreshTokenSession(authId, refreshTokenHash, userAgent)

    const accessToken = await jwtService.generateAccessToken(
      {
        sub: authId,
        email,
        jti: jwtService.generateJit(),
      },
      60 * 5
    );

    return { accessToken, refreshToken };
  }

  static async resolveAuthUser(
    email: string,
    userAgent?: string | null
  ): Promise<string> {
    const identifiersRepo = new IdentifiersRepository(sql)
    const existing = await identifiersRepo.checkExistenceOfIdentifier(IdentifierType.EMAIL, email)

    if (existing) {
      return existing.authid;
    }

    const [created] = await sql`
      INSERT INTO auth_user DEFAULT VALUES
      RETURNING id
    `;

    await sql`
      INSERT INTO identifiers (
        type,
        value,
        isverified,
        isactive,
        authid
      )
      VALUES (
        'email',
        ${email},
        true,
        true,
        ${created.id}
      )
    `;

    return created.id;
  }
}
