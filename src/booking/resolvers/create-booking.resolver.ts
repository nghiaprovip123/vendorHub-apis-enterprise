import { CreateBooking } from "@/booking/services/create-booking.service"
import { BookingError } from "@/common/utils/error/booking.error"
import { unknown } from "zod";

export class createBooking {
  async createBookingByCustomer  (
    _: unknown,
    args: { input : any },
    ctx : any
  ) {

    try {
      const result = await CreateBooking.createBookingByCustomer(args.input);

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
    }

    catch (error : any) {
      throw new Error(BookingError.BOOKING_CREATE_COMMON_ERROR)
    }
  }

  async createBookingInBackOffice  (
    _: unknown,
    args: { input : any },
    ctx : any
  ) {

    try {
      const result = await CreateBooking.createBookingInBackOffice(args.input);

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
    }

    catch (error : any) {
      throw new Error(BookingError.BOOKING_CREATE_COMMON_ERROR)
    }
  }
}

const resolver = new createBooking();

  
  export const CreateBookingResolver = {
    Mutation: {
      createBookingByCustomer: resolver.createBookingByCustomer.bind(resolver),
      createBookingInBackOffice: resolver.createBookingInBackOffice.bind(resolver),
    }
  };
  
  