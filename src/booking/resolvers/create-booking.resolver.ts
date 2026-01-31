import { CreateBooking } from "@/booking/services/create-booking.service"
import { BookingError } from "@/common/utils/error/booking.error"
const createBookingByCustomer = async (
    _: unknown,
    args: { input: any },
    ctx: any
  ) => {
    try {
      const result = await CreateBooking.createBookingByCustomer(args.input);

      console.log(result)

      if (!result.id) {
        throw new Error("Failed to create booking: ID is null");
      }

      
    
      return {
        id: result.id,
        serviceId: result.serviceId,
        staffId: result.staffId,
        customerName: result.customerName,
        customerPhone: result.customerPhone,
        customerEmail: result.customerEmail,
        notes: result.notes,
        status: result.status,
        cancelledAt: result.cancelledAt,
        cancelReason: result.cancelReason,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        slot: result.slot ? {
          day: result.slot.day,
          startTime: result.slot.startTime,
          endTime: result.slot.endTime,
          durationInMinutes: result.slot.durationInMinutes
        } : null
      };
    } catch (error: any) {
      console.error("Error creating booking:", error);
      throw new Error(BookingError.BOOKING_CREATE_COMMON_ERROR);
    }
  };
  
  export const CreateBookingByCustomer = {
    Mutation: {
      createBookingByCustomer
    }
  };
  
  