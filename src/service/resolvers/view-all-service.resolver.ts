import { requireAuth } from "@/common/guards/auth-graph.guard"
import { ViewAllServiceService } from "@/service/services/view-all-service.service"

const viewAllService = async (
    _: unknown,
    args : { input : any },
    ctx: any
) => {
    requireAuth(ctx) 

    const result = await ViewAllServiceService()
    return result
}

export const ViewAllService = {
    Query : {
        viewAllService
    }
}