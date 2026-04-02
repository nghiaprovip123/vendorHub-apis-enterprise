import { GraphQLUpload } from "graphql-upload-minimal"
import { UpdateServiceService } from "@/service/services/update-service.service"
import { requireAuth } from "@/common/guards/auth-graph.guard"

const updateService = async (
    _: unknown,
    args : { input : any },
    ctx : any
) => {
    try {
        requireAuth(ctx) 

        const result = await UpdateServiceService(args.input)
        return result
    }
    catch (error:any) {
        throw error
    }
}

export const UpdateService = {
    Upload: GraphQLUpload,
    
    Service: {
        price: (parent: any) => parent.pricing ?? parent.price,
        medias: (parent: any) => parent.medias || []
    },
    
    Mutation: {
        updateService
    }
}