import { prisma } from "@/lib/prisma"
import { CategoryLevel } from "@prisma/client"

export const ViewCategoryListService = async (

) => {
    const service = await prisma.category.findMany(
        {
            where : {
                level : CategoryLevel.LEVEL_1
            }
        }
    )
    
    return {
        result : service
    }
}