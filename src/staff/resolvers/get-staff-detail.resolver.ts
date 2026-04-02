import { requireAuth } from "@/common/guards/auth-graph.guard"
import { GetStaffDetailService } from "@/staff/services/get-staff-detail.service"
const getStaffDetail = async (
    _: unknown,
    args : { input : any },
    ctx : any
) => {
    requireAuth(ctx)

    const result = await GetStaffDetailService(args.input.id)
    return result
}

export const GetStaffDetail = {
    Query : {
        getStaffDetail        
    }
}