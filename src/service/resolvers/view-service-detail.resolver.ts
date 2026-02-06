import { prisma } from "@/lib/prisma"
import { ServiceError } from "@/common/utils/error/service.error"

const viewServiceDetail = async (
    _: unknown,
    args: { input : any },
    ctx : any
) => {
    try {
        const {
            id
        } = args.input 
    
        if (!id) {
            throw new Error(ServiceError.SERVICE_IS_NOT_EXIST)
        }
    
        const service = await prisma.service.findUnique(
            {
                where : {
                    id : id
                }
            }
        )

        console.log(service)
    
        return { service } 
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