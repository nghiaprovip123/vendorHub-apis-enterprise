import {z} from "zod"

export const SendOTPSchema = z.object(
    {
        phone: z.string(),
        email: z.email(),
    }
)