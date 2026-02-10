import { ViewCategoryListService } from "@/service/services/view-category-list.service"

const viewCategoryList = async (
    _: unknown,
) => {
    const result = await ViewCategoryListService()
    console.log(result)
    return result
}

export const ViewCategoryList = {
    Query : {
        viewCategoryList
    }
}