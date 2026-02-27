import { CreateBooking } from "@/booking/services/create-booking.service"
import { BookingError } from "@/common/utils/error/booking.error"

export class CreateBookingClass {
  async createBookingByCustomer(
    _: unknown,
    args: { input: any },
    ctx: any
  ) {
    try {
      const result = await CreateBooking.createBookingByCustomer(args.input);

      return {
        id: result.id,
        bookingService: result.bookingService,
        bookingStaff: result.bookingStaff,
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
      throw error
    }
  }

  async createBookingInBackOffice(
    _: unknown,
    args: { input: any },
    ctx: any
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
    } catch (error: any) {
      throw error
    }
  }
}

const resolverInstance = new CreateBookingClass();

export const CreateBookingResolver = {
  Mutation: {
    createBookingByCustomer: resolverInstance.createBookingByCustomer.bind(resolverInstance),
    createBookingInBackOffice: resolverInstance.createBookingInBackOffice.bind(resolverInstance),
  }
};