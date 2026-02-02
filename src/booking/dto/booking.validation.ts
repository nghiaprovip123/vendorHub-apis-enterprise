import z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"

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

export const GetBookingListDto = z.object(
    {
        startDate: z.string(BookingError.BOOKING_LIST_MISSING_START_DATE_INFORMATION),
        endDate: z.string(BookingError.BOOKING_LIST_MISSISING_END_DATE_INFORMATION)
    }
)

