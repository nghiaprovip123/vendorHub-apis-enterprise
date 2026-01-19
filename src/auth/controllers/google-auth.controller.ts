import { Request, Response, NextFunction } from "express";
import sql from "@/lib/postgresql";
import argon2 from "argon2";
import { jwtService } from "@/common/jwt/index.jwt";
import { optionsCookie } from "@/common/utils/cookie.utils";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfoResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  picture: string;
}

export const GoogleOAuthCallbackController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userAgent = req.headers["user-agent"] ?? null;
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ message: "MISSING AUTHORIZATION CODE" });
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("FAILED TO EXCHANGE GOOGLE AUTHORIZATION CODE");
    }

    const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
    const googleAccessToken = tokenData.access_token;

    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      throw new Error("FAILED TO FETCH GOOGLE USER INFO");
    }

    const googleUser = (await userInfoResponse.json()) as GoogleUserInfoResponse;

    if (!googleUser.email) {
      throw new Error("GOOGLE ACCOUNT HAS NO EMAIL");
    }

    const email = googleUser.email;

    const [existingUser] = await sql`
      SELECT authid
      FROM identifiers
      WHERE type = 'email'
        AND value = ${email}
        AND isactive = true
      LIMIT 1
    `;

    let authId: string;

    if (!existingUser) {
      const [newUser] = await sql`
        INSERT INTO auth_user DEFAULT VALUES
        RETURNING id
      `;

      authId = newUser.id;

      await sql`
        INSERT INTO identifiers (
          type,
          value,
          isverified,
          isactive,
          authid,
          userAgent
        )
        VALUES (
          'email',
          ${email},
          true,
          true,
          ${authId},
          ${userAgent}
        )
      `;
    } else {
      authId = existingUser.authid;
    }

    const refreshToken = await jwtService.generateRefreshToken(
      {
        sub: authId,
        email,
        jti: jwtService.generateJit(),
      },
      60 * 60 * 24 * 7 
    );

    const refreshTokenHash = await argon2.hash(refreshToken);

    await sql`
      INSERT INTO refresh_token_sessions (
        authid,
        refreshtokenhash,
        expiresat,
        sessionid,
        userAgent
      )
      VALUES (
        ${authId},
        ${refreshTokenHash},
        NOW() + INTERVAL '7 days',
        gen_random_uuid(),
        ${userAgent}
      )
    `;

    const accessToken = await jwtService.generateAccessToken(
      {
        sub: authId,
        email,
        jti: jwtService.generateJit(),
      },
      60 * 5 // 5 minutes
    );

    res.cookie("refreshToken", refreshToken, optionsCookie)
    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
};
