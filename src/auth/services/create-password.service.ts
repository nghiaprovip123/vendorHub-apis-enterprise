import argon2 from "argon2";
import { IdentifierType } from "@/auth/enum/identifier-type.enum";
import { VerifyOTPType } from "@/auth/enum/verify-otp-type.enum"
import { AuthGuard } from "@/common/guards/auth.guard";
import sql from "@/lib/postgresQL";
import { PasswordUtilities } from "@/common/utils/password.utils"
import { IdentifiersRepository } from "@/auth/repositories/identifiers.repository"
export class CreatePasswordService {
    async createPasswordByRegisterationFlow(params: {
        userId: string;
        password: string;
    }) {
        const { userId, password } = params;
        const identifiersRepo = new IdentifiersRepository(sql)


        const [user] = await sql`
            SELECT * FROM auth_user
            WHERE id = ${userId}
        `;
        if (!user) {
            throw new Error("KHÔNG TÌM THẤY USER");
        }

        const hashPassword = await PasswordUtilities.hashPassword(password)
        try{
            await identifiersRepo.createPasswordIdentifier(IdentifierType.PASSWORD, hashPassword, userId)
        } catch (err: any) {
            if (err.code === "23505") {
                throw new Error("KHÔNG THỂ TẠO MẬT KHẨU VÌ NGƯỜI DÙNG ĐÃ TỒN TẠI");
            }
            throw err;
        }

        return user;
    }

    async createPasswordByForgotFlow(params: {
        extractedUser: any;
        password: string;
    }) {
        const { extractedUser, password } = params;
        const identifiersRepo = new IdentifiersRepository(sql)
        const { sub, purpose } = extractedUser;

        const [user] = await sql`
            SELECT * FROM auth_user
            WHERE id = ${sub}
        `;
        if (!user) {
            throw new Error("KHÔNG TÌM THẤY USER");
        }
        
        if (purpose !== VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD) {
            throw new Error("TOKEN KHÔNG CÓ HIỆU LỰC Ở API NÀY");
        }

        const hashPassword = await PasswordUtilities.hashPassword(password)
        
        try {
            await identifiersRepo.updatePasswordIdentifier(IdentifierType.PASSWORD, sub, hashPassword)
        } catch (err: any) {
            if (err.code === "23505") {
                throw new Error("KHÔNG THỂ TẠO MẬT KHẨU VÌ NGƯỜI DÙNG ĐÃ TỒN TẠI");
            }
            throw err;
        }

        return user;
    }
}

export const createPasswordService = new CreatePasswordService()