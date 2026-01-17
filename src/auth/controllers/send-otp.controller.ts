import { Request, Response, NextFunction } from "express"
import { sendOTPService } from "@/auth/services/send-otp.service"

export class SendOTPController {
    async SendOTPController ( req: Request, res: Response, next: NextFunction ) {
        try {
            const { phone, type, email} = req.body;
      
            const result = await sendOTPService.sendOTP({phone, type, email});
    
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