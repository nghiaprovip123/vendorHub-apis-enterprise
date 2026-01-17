import { Request, Response, NextFunction } from "express"
import { sendOTPService } from "@/auth/services/send-otp.service"

export class SendOTPController {
    async SendOTPByRegisterationFlow ( req: Request, res: Response, next: NextFunction ) {
        try {
            const { phone, email} = req.body;
      
            const result = await sendOTPService.sendOTPByRegisterationFlow({phone, email});
    
            return res.json({
              success: true,
              otp: result.otp,
              expiresAt: result.expiresAt,
              remaining: result.remainingAttempts
            });
        }
        catch(err){
            next(err)
        }   
    }

    async SendOTPByForgotFlow ( req: Request, res: Response, next: NextFunction ) {
        try {
            const { phone, email} = req.body;
      
            const result = await sendOTPService.sendOTPByForgotFlow({phone, email});
    
            return res.json({
              success: true,
              otp: result.otp,
              expiresAt: result.expiresAt,
              remaining: result.remainingAttempts
            });
        }
        catch(err){
            next(err)
        }   
    }
}

export const sendOTPController = new SendOTPController()