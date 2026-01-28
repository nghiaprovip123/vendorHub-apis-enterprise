// staff/resolvers/update-staff.resolver.ts
import { GraphQLUpload } from "graphql-upload-minimal";
import { updateStaffService } from "@/staff/services/update-staff.service";
import { StaffError } from "@/common/utils/error/staff.error"
const updateStaff = async (
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    try {
        const result = await updateStaffService(args.input);
        
        if (!result) {
            throw new Error(StaffError.COMMON_UPDATE_STAFF_ERROR);
        }
        console.log(result)
        return result;
    } catch (error: any) {
        throw error;
    }
}

export const UpdateStaff = {
    Upload: GraphQLUpload,
    Mutation: {
        updateStaff, 
    },
};