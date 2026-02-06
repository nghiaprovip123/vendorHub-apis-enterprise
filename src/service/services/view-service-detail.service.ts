import { prisma } from "@/lib/prisma"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { ViewServiceDetail } from "@/service/dto/service.validation"
import * as z from "zod"
type ViewServiceDetailInput = z.infer < typeof ViewServiceDetail > 
export const ViewServiceDetailService = async (
    input : ViewServiceDetailInput
) => {
        const {
            id
        } = input 
        
        const serviceRepo = new ServiceRepository(prisma)
         
        const service = await serviceRepo.findById(id)

        return { service }  
}