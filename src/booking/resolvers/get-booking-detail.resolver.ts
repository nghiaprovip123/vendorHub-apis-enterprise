import { viewBookingDetailService } from "@/booking/services/get-booking-detail.service"
import { requireAuth } from "@/common/guards/auth-graph.guard";
const viewBookingDetail = async(
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    try {
        requireAuth(ctx)

        const result = await viewBookingDetailService(args.input.bookingId)
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
          };       }
    catch(error: any) {
        throw error
    }            
}
export const ViewBookingDetail = {
    Query: {
        viewBookingDetail
    }
}