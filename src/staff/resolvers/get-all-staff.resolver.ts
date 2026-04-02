import { requireAuth } from "@/common/guards/auth-graph.guard"
import { getAllStaffService } from "@/staff/services/get-all-staff.service"
const getAllStaff = async (
    _: unknown,
    args : { input : any },
    ctx : any
) => {
    requireAuth(ctx)

    const result = await getAllStaffService()
    return result
}

export const GetAllStaff = {
    Query : {
        getAllStaff
    }
}