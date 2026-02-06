import { prisma } from "@/lib/prisma"
import { ServiceError } from "@/common/utils/error/service.error"
import { ViewServiceDetailService } from "@/service/services/view-service-detail.service"

const viewServiceDetail = async (
    _: unknown,
    args: { input : any },
    ctx : any
) => {
    try {
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