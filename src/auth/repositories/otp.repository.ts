import sql from '@/lib/postgresql'

export class OTPRepository {
    constructor(private readonly sql: any) {}

    // Count OTP by email + type within last 15 minutes
    async countOTPWithin15Minutes(
        email: string,
        type: string
    ): Promise<number> {
        const [{ count }] = await this.sql`
            SELECT COUNT(*)::int AS count
            FROM otps
            WHERE type = ${type}
              AND email = ${email}
              AND createdat > NOW() - INTERVAL '15 minutes'
        `

        // luôn trả number (0,1,2...)
        return count
    }

    // Deactivate old OTPs
    async deactiveOldOTPs(
        email: string,
        phone: string,
        type: string
    ): Promise<void> {
        await this.sql`
            UPDATE otps
            SET isverified = true,
                isactive = false
            WHERE type = ${type}
              AND email = ${email}
              AND phone = ${phone}
              AND isverified = false
              AND isactive = true
        `
    }

    // Create new OTP
    async createNewOTP(
        email: string,
        phone: string,
        type: string,
        otp: string
    ): Promise<{ id: string; expiresat: Date }> {
        const [{ id, expiresat }] = await this.sql`
            INSERT INTO otps (
                type,
                email,
                otp,
                expiresat,
                phone,
                isverified,
                isactive
            )
            VALUES (
                ${type},
                ${email},
                ${otp},
                NOW() + INTERVAL '15 minutes',
                ${phone},
                false,
                true
            )
            RETURNING id, expiresat
        `

        return {
            id,
            expiresat
        }
    }

    // Find OTP by id
    async findSentOTP(id: string) {
        const [otp] = await this.sql`
            SELECT id, email, phone, expiresat, isverified, isactive
            FROM otps
            WHERE id = ${id}
        `

        return otp
    }

    async findOTPForVerification(otp: string, email: string, type: string) {
        const [otpRow] = await this.sql`
            SELECT id
                FROM otps
                    WHERE otp = ${otp}
                        AND email = ${email}
                        AND type = ${type}
                        AND isverified = false
                        AND isactive = true
                        AND expiresat > NOW()
        `
        return otpRow
    }

    async setOTPAsVerified (id: string) {
        await this.sql`
            UPDATE otps
                SET isverified = true,
                    isactive = false,
                    verifiedat = NOW()
            WHERE id = ${id}
        `
    }

}
