import { prisma } from "@/lib/prisma"

const viewAllService = async (
    _: unknown,
    args : { input : any },
    ctx: any
) => {
    const allService = await prisma.service.findMany()

    return {
        items : allService
    }
}

export const ViewAllService = {
    Query : {
        viewAllService
    }
}