import sql from "@/lib/postgresql"
import { AuthGuard } from "@/common/guards/auth.guard"

export class SignOutService {
  async execute(refreshToken: string): Promise<void> {
    const authGuard = new AuthGuard(refreshToken);
    const payload = authGuard.extractTokenPayload();

    const { sub } = payload;
    if (!sub) {
      throw new Error("INVALID_TOKEN_PAYLOAD");
    }

    await sql`
      UPDATE refresh_token_sessions
      SET revoked = true,
          revokedat = NOW(),
          revokedby = ${sub}
      WHERE authid = ${sub}
        AND revoked = false
    `;
  }
}
