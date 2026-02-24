import { prisma } from "@/lib/prisma"
import { CategoryLevel } from "@prisma/client"

const viewAllService = async (
    _: unknown,
    args : { input : any },
    ctx: any
) => {
    const allService = await prisma.service.findMany(
        {
            where : {
                category : {
                    level : CategoryLevel.LEVEL_1
                }
            }
        }
    )

    return {
        items : allService
    }
}

export const ViewAllService = {
    Query : {
        viewAllService
    }
}