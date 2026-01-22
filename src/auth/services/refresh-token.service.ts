import sql from "@/lib/postgresql";
import argon2 from "argon2";
import { jwtService } from "@/common/jwt/index.jwt";
import { RefreshTokenSessionRepository } from '@/auth/repositories/refresh-token-sessions.repository'
import { IdentifiersRepository } from '@/auth/repositories/identifiers.repository'
import { IdentifierType } from "@/auth/enum/identifier-type.enum"
type RefreshTokenResult = {
  accessToken: string;
  refreshToken: string;
};

export class RefreshTokenService {
  static async execute(
    refreshToken: string,
    userAgent: string
  ): Promise<RefreshTokenResult> {

    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error("SAI TOKEN, VUI LÒNG THỬ LẠI");
    }

    const { sub } = payload;

    return await sql.begin(async (tx) => {
      const refreshTokenSessionRepo = new RefreshTokenSessionRepository(tx)
      const identifiersRepo = new IdentifiersRepository(tx)
      const session = await refreshTokenSessionRepo.findSession(sub)

      if (!session) {
        throw new Error("KHÔNG TÌM THẤY SESSION REFRESH TOKEN");
      }

      const isValid = await argon2.verify(
        session.refreshtokenhash,
        refreshToken
      );

      if (!isValid) {
        throw new Error("REFRESH TOKEN KHÔNG HỢP LỆ");
      }

      // Rotate: xoá session cũ
      await refreshTokenSessionRepo.deleteOldSession(session.sessionid)

      const email = await identifiersRepo.findEmailIdentifier(sub, IdentifierType.EMAIL)

      const accessToken = jwtService.generateAccessToken(
        {
          sub,
          email,
          jti: jwtService.generateJit(),
        },
        300
      );

      const newRefreshToken = jwtService.generateRefreshToken(
        {
          sub,
          email,
          jti: jwtService.generateJit(),
        },
        604800
      );

      const newRefreshTokenHash = await argon2.hash(newRefreshToken);

      await refreshTokenSessionRepo.createRefreshTokenSession(sub, newRefreshTokenHash, userAgent)

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    });
  }
}
