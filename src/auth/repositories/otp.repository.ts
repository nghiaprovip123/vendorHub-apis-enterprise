import sql from "@/lib/postgresql"
import { VerifyOTPType } from "@/auth/enum/veirfy-otp-type.enum"

export type OtpEntity = {
    id: string
    email: string
    phone: string
    otp: string
    type: VerifyOTPType
    expiresat: Date
    isverified: boolean
    isactive: boolean
    attemptcount: number
    createdat: Date
    verifiedat?: Date
}

export type CreateOtpInput = {
    email: string
    phone: string
    otp: string
    type: VerifyOTPType
    expiresAt: Date
}

export class OtpRepository {
    async countRecentOtps(email: string, type: VerifyOTPType, minutesAgo: number): Promise<number> {
        const [{ count }] = await sql`
            SELECT COUNT(*)::int AS count
            FROM otps
            WHERE type = ${type}
                AND email = ${email}
                AND createdat > NOW() - INTERVAL '${minutesAgo} minutes'
        `
        return count
    }

    async deactivateOtps(tx: any, params: { email: string; phone: string; type: VerifyOTPType }): Promise<void> {
        const { email, phone, type } = params
        await tx`
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

    async create(tx: any, input: CreateOtpInput): Promise<OtpEntity> {
        const { email, phone, otp, type, expiresAt } = input
        
        const [created] = await tx`
            INSERT INTO otps (
                type, email, otp, expiresat, phone
            ) VALUES (
                ${type}, ${email}, ${otp}, ${expiresAt}, ${phone}
            )
            RETURNING *
        `
        return created
    }

    async findById(tx: any, id: string): Promise<OtpEntity | null> {
        const [otp] = await tx`
            SELECT * FROM otps WHERE id = ${id}
        `
        return otp || null
    }

    async findActiveOtp(tx: any, params: {
        otp: string
        email: string
        type: VerifyOTPType
    }): Promise<OtpEntity | null> {
        const { otp, email, type } = params
        
        const [otpRow] = await tx`
            SELECT id, attemptcount
            FROM otps
            WHERE otp = ${otp}
                AND email = ${email}
                AND type = ${type}
                AND isverified = false
                AND isactive = true
                AND expiresat > NOW()
        `
        return otpRow || null
    }

    async markAsVerified(tx: any, otpId: string): Promise<void> {
        await tx`
            UPDATE otps
            SET isverified = true,
                isactive = false,
                verifiedat = NOW()
            WHERE id = ${otpId}
        `
    }

    async incrementAttempt(tx: any, otpId: string): Promise<void> {
        await tx`
            UPDATE otps
            SET attemptcount = attemptcount + 1
            WHERE id = ${otpId}
        `
    }
}

export const otpRepository = new OtpRepository()