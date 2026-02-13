import z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"
import { StaffError } from "@/common/utils/error/staff.error"

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

export const assignStaffByBookingRequestDto = z.object(
    {
        bookingId: z.string(BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID),
        staffId: z.string(StaffError.MISSING_STAFF_ID_ERROR)
    }
)