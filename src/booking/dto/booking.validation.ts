import z from "zod"

export const CreateBookingDto = z.object(
    {
        serviceId: z.string(),
        staffId: z.string().optional(),      
        day: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string(),
        notes: z.string().optional()
        
    }
)