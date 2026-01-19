import sql from "@/lib/postgresQL";
import argon2 from "argon2";
import { jwtService } from "@/common/jwt/index.jwt";

type RefreshTokenResult = {
  accessToken: string;
  refreshToken: string;
};

export class RefreshTokenService {
  static async execute(
    refreshToken: string,
    userAgent: string | null
  ): Promise<RefreshTokenResult> {

    const payload = await jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new Error("SAI TOKEN, VUI LÒNG THỬ LẠI");
    }

    const { sub } = payload;

    return await sql.begin(async (tx) => {
      const [session] = await tx`
        SELECT refreshtokenhash, sessionid
        FROM refresh_token_sessions
        WHERE authid = ${sub}
          AND expiresat > NOW()
        ORDER BY createdat DESC
        LIMIT 1
      `;

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
      await tx`
        DELETE FROM refresh_token_sessions
        WHERE sessionid = ${session.sessionid}
      `;

      const [{ email }] = await tx`
        SELECT value AS email
        FROM identifiers
        WHERE type = 'email'
          AND authid = ${sub}
      `;

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

      await tx`
        INSERT INTO refresh_token_sessions (
          authid,
          refreshtokenhash,
          expiresat,
          sessionid,
          useragent
        )
        VALUES (
          ${sub},
          ${newRefreshTokenHash},
          NOW() + INTERVAL '7 days',
          gen_random_uuid(),
          ${userAgent}
        )
      `;

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    });
  }
}
