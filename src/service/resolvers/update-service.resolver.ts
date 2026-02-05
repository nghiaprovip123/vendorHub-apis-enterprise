import { GraphQLUpload } from "graphql-upload-minimal"
import { UpdateServiceService } from "@/service/services/update-service.service"

const updateService = async (
    _: unknown,
    args : { input : any },
    ctx : any
) => {
    try {
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