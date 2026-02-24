import { ViewAllServiceService } from "@/service/services/view-all-service.service"

const viewAllService = async (
    _: unknown,
    args : { input : any },
    ctx: any
) => {
    const result = await ViewAllServiceService()
    return result
}

export const ViewAllService = {
    Query : {
        viewAllService
    }
}