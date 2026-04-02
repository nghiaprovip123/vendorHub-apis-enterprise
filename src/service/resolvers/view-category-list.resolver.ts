import { requireAuth } from "@/common/guards/auth-graph.guard"
import { ViewCategoryListService } from "@/service/services/view-category-list.service"

const viewCategoryList = async (
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    requireAuth(ctx) 

    const result = await ViewCategoryListService()
    console.log(result)
    return result
}

export const ViewCategoryList = {
    Query : {
        viewCategoryList
    }
}