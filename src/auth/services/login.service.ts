import sql from '@/lib/postgresQL';
import argon2 from 'argon2';
import ApiError from '@/common/utils/ApiError';
import { IdentifierType } from '@/auth/enum/identifier-type.enum';
import { jwtService } from '@/common/jwt/index.jwt';
import { PasswordUtilities } from '@/common/utils/password.utils'
import { IdentifiersRepository } from '@/auth/repositories/identifiers.repository'
import { RefreshTokenSessionRepository } from '@/auth/repositories/refresh-token-sessions.repository'
type LoginInput = {
  email: string;
  password: string;
  userAgent: string;
};

type LoginResult = {
  refreshToken: string;
};

const identifiersRepo = new IdentifiersRepository(sql)
const refreshTokenSessionRepo = new RefreshTokenSessionRepository(sql)
export class LoginService {
  async login({ email, password, userAgent }: LoginInput): Promise<LoginResult> {
    const identifier = await identifiersRepo.findIdentifier(IdentifierType.EMAIL, email)

    if (!identifier?.authid) {
      throw new ApiError(403, 'TÀI KHOẢN KHÔNG TỒN TẠI HOẶC ĐÃ BỊ TẠM KHOÁ');
    }

    const authid = identifier.authid;

    const passwordRow = await identifiersRepo.findPasswordIdentifier(authid, IdentifierType.PASSWORD)
  
  if (!passwordRow?.hashPassword) {
    throw new ApiError(500, 'PASSWORD KHÔNG CHÍNH XÁC');
  }
  
  const isValid = await PasswordUtilities.comparePassword(
    passwordRow.hashPassword,
    password
  );
  
  if (!isValid) {
    throw new ApiError(401, 'KHÔNG ĐÚNG THÔNG TIN ĐĂNG NHẬP');
  }

    const refreshToken = await jwtService.generateRefreshToken(
      {
        sub: authid,
        email,
        jti: jwtService.generateJit(),
      },
      604800 
    );

    const refreshTokenHash = await argon2.hash(refreshToken);

    await refreshTokenSessionRepo.createRefreshTokenSession(authid, refreshTokenHash, userAgent)

    return { refreshToken };
  }
}

export const authService = new LoginService();
