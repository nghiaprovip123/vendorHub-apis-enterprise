import { ViewServiceDetailService } from "@/service/services/view-service-detail.service"
import { requireAuth } from '@/common/guards/auth-graph.guard'

const viewServiceDetail = async (
    _: unknown,
    args: { input : any },
    ctx : any
) => {
    try {
        requireAuth(ctx)

        const result = await ViewServiceDetailService(args.input)

        return result
    }
    catch (error : any) {
        throw error
    }
}

export const ViewServiceDetail = {
    Query : {
        viewServiceDetail
    }
}