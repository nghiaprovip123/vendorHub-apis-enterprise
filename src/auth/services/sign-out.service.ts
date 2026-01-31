import sql from "@/lib/postgresQL"

export class SignOutService {
  async execute(extractedUser: any): Promise<void> {
    const { sub } = extractedUser;
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
