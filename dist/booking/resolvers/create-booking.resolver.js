"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBookingResolver = exports.CreateBookingClass = void 0;
const create_booking_service_1 = require("../../booking/services/create-booking.service");
class CreateBookingClass {
    async createBookingByCustomer(_, args, ctx) {
        try {
            const result = await create_booking_service_1.CreateBooking.createBookingByCustomer(args.input);
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
        }
        catch (error) {
            throw error;
        }
    }
    async createBookingInBackOffice(_, args, ctx) {
        try {
            const result = await create_booking_service_1.CreateBooking.createBookingInBackOffice(args.input);
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
        catch (error) {
            throw error;
        }
    }
}
exports.CreateBookingClass = CreateBookingClass;
const resolverInstance = new CreateBookingClass();
exports.CreateBookingResolver = {
    Mutation: {
        createBookingByCustomer: resolverInstance.createBookingByCustomer.bind(resolverInstance),
        createBookingInBackOffice: resolverInstance.createBookingInBackOffice.bind(resolverInstance),
    }
};
