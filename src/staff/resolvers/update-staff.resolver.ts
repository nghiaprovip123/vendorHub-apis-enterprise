// staff/resolvers/update-staff.resolver.ts
import { GraphQLUpload } from "graphql-upload-minimal";
import { updateStaffService } from "@/staff/services/update-staff.service";

const updateStaff = async (
    _: unknown,
    args: { input: any },
    ctx: any
) => {
    try {
        const result = await updateStaffService(args.input);
        
        if (!result) {
            throw new Error('CẬP NHẬT NHÂN VIÊN THẤT BẠI');
        }
        console.log(result)
        return result;
    } catch (error: any) {
        console.error('Update staff error:', error);
        throw error;
    }
}

export const UpdateStaff = {
    Upload: GraphQLUpload,
    Mutation: {
        updateStaff, // ← Sử dụng function đã định nghĩa ở trên
    },
};