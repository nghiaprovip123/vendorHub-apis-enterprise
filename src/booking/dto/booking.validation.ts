import z from "zod"
import { duration } from "zod/v4/classic/iso.cjs"

export const CreateBooking = z.object(
    {
        serviceId: z.string(),
        staffId: z.string().optional(),      
        day: z.string(),
        durationInMinute: z.int(),
        startTime: z.string(),
        endTime: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string(),
        notes: z.string().optional()
    }
)