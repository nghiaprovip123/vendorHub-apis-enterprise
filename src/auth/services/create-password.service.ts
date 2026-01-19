import sql from "@/lib/postgresql";
import { IdentifierType } from "@/auth/enum/identifier-type.enum";
import { VerifyOTPType } from "@/auth/enum/veirfy-otp-type.enum"
import { AuthGuard } from "@/common/guards/auth.guard";
import { PasswordUtilities } from "@/common/utils/password.utils"
export class CreatePasswordService {
    async createPasswordByRegisterationFlow(params: {
        token: string;
        password: string;
    }) {
        const { token, password } = params;

        const guard = new AuthGuard(token);
        const payload = guard.extractTokenPayload();
        const { sub } = payload;

        const [user] = await sql`
            SELECT * FROM auth_user
            WHERE id = ${sub}
        `;
        if (!user) {
            throw new Error("KHÔNG TÌM THẤY USER");
        }

        const hashPassword = await PasswordUtilities.hashPassword(password)
        try{
            await sql`
            INSERT INTO identifiers (type, value, isverified, isactive, authid)
            VALUES (
                ${IdentifierType.PASSWORD},
                ${hashPassword},
                true,
                true,
                ${sub}
            )
        `;
        } catch (err: any) {
            if (err.code === "23505") {
                throw new Error("KHÔNG THỂ TẠO MẬT KHẨU VÌ NGƯỜI DÙNG ĐÃ TỒN TẠI");
            }
            throw err;
        }

        return user;
    }

    async createPasswordByForgotFlow(params: {
        token: string;
        password: string;
    }) {
        const { token, password } = params;

        const guard = new AuthGuard(token);
        const payload = guard.extractTokenPayload();
        const { sub, purpose } = payload;

        const [user] = await sql`
            SELECT * FROM auth_user
            WHERE id = ${sub}
        `;
        if (!user && purpose !== VerifyOTPType.VERIFY_OTP_FORGOT_PASSWORD) {
            throw new Error("KHÔNG TÌM THẤY USER HOẶC TOKEN KHÔNG CÓ HIỆU LỰC Ở API NÀY");
        }

        const hashPassword = await PasswordUtilities.hashPassword(password)
        
        try{
                await sql`
                    UPDATE identifiers
                    SET value = ${hashPassword},
                        isverified = true,
                        isactive = true
                    WHERE authid = ${sub}
                        AND type = ${IdentifierType.PASSWORD}
                    RETURNING authid
                `
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