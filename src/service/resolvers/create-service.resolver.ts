import { GraphQLUpload } from "graphql-upload-minimal"
import { CreateServiceService } from "@/service/services/create-service.service"
import { requireAuth } from "@/common/guards/auth-graph.guard"

const createService = async (
    _: unknown, 
    args: { input: any }, 
    ctx: any
) => {
    try {
      requireAuth(ctx)  
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