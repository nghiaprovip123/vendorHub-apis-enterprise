import argon2 from "argon2"


export class PasswordUtilities {
    static async hashPassword(password: string): Promise<string> {
      return argon2.hash(password);
    }
  
    static async comparePassword(
      hashPassword: string,
      password: string
    ): Promise<boolean> {
      return argon2.verify(hashPassword, password);
    }
  }
  