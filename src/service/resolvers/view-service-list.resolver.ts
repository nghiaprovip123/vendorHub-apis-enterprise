import { requireAuth } from "@/common/guards/auth-graph.guard"
import { ViewServiceListService } from "@/service/services/view-service-list.service"

const viewServiceList = async(
    _: unknown,
    args: { input : any },
    ctx: any
) => {
    try {
        requireAuth(ctx) 

        const { page } = args.input
        const result = await ViewServiceListService(page)
        return result
    }
    catch (error: any) {
        throw error
    }
}

export const ViewServiceList = {
    Query : {
        viewServiceList
    },
}