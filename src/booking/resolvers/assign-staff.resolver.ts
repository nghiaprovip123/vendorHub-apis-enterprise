import { assignStaffByBookingRequestService } from "@/booking/services/assign-staff.service"
import { requireAuth } from "@/common/guards/auth-graph.guard"
const assignStaffByBookingRequest = async (
    _: unknown,
    args: { input : any },
    ctx: any
) => {
    try {
        requireAuth(ctx)

        const result = await assignStaffByBookingRequestService(args.input)
        return {
            success: true,
            message: "Assign successfully a Staff",
            booking: result
        }    
    }
    catch (error: any) {
        throw error
    }
}

export const AssignStaffByBookingRequest = {
    Mutation: {
        assignStaffByBookingRequest
    }
}