import { requireAuth } from "@/common/guards/auth-graph.guard";
import { getAvailableStaffbyBookingTimeService } from "@/staff/services/get-available-staff.service"

const getAvailableStaffByBookingTime = async (
  _: unknown,
  args: { input: any },
  ctx : any
) => {
  try { 
    requireAuth(ctx)

     const result = await getAvailableStaffbyBookingTimeService(args.input);
     return result
   }
   catch (error: any) {
    throw error
   }
}

export const GetAvailableStaff = {
  Query: {
    getAvailableStaffByBookingTime,
  },
};
