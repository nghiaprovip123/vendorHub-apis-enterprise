import { ServiceMediaType } from "@prisma/client"
import { GraphQLUpload } from "graphql-upload-minimal"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import { prisma } from "@/lib/prisma"
import { CreateServiceService } from "@/service/services/create-service.service"

const createService = async (
    _: unknown, 
    args: { input: any }, 
    ctx: any
) => {
    try {
      const result = await CreateServiceService(args.input)
      console.log(result)
      return result
    } catch (err) {
      console.error('Create service error:', err)
      throw err
    }
}
export const CreateService = {
    Upload: GraphQLUpload,
    
    Service: {
        price: (parent: any) => parent.pricing ?? parent.price,
        medias: (parent: any) => parent.medias || []
    },
    
    Mutation: {
        createService
    }
}