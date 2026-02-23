import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import * as z from "zod"
import { updateStaffSchema } from "@/staff/dto/staffs.validation"
import { StaffRepository } from "@/staff/repositories/staff.repository"
import { WorkingHoursRepository } from "@/staff/repositories/working-hours.repository"
import { StaffError } from "@/common/utils/error/staff.error"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { ServiceError } from "@/common/utils/error/service.error"
import { StaffServiceRepository } from "@/staff/repositories/staff-service.repository"
import ApiError from "@/common/utils/ApiError.utils"
import { DateTimeStandardizer } from "@/common/utils/date-standard.utils"

type UpdateStaffType = z.infer<typeof updateStaffSchema>

export const updateStaffService = async (input: UpdateStaffType) => {
    const existingStaff = await prisma.staff.findUnique({
        where: { id: input.id }
    });

    if (!existingStaff) {
        throw new ApiError(204, StaffError.NOT_FOUND_STAFF_ERROR);
    }

    let avatar_url: string | undefined = existingStaff.avatar_url || undefined;
    let avatar_public_id: string | undefined = existingStaff.avatar_public_id || undefined;

    if (input.avatar) {
        try {
            const file = await input.avatar;
            const stream = file.createReadStream();

            const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
            const folder = `${env}/staffs`;
            const public_id = `${input.id}/avatar`;

            if (existingStaff.avatar_public_id) {
                const upload = await CloudinaryRest.OverwriteImageInCloudinary(
                    stream,
                    {
                        folder,
                        public_id,
                        resource_type: "image",
                        contentType: file.mimetype || 'image/png',
                        filename: file.filename || 'avatar.png',
                        overwrite: true,
                    }
                );
                avatar_url = upload.secure_url;
                avatar_public_id = upload.public_id;
            } else {
                const upload = await CloudinaryRest.UploadImageToCloudinary(
                    stream,
                    {
                        folder,
                        public_id,
                        resource_type: "image",
                    }
                );
                avatar_url = upload.secure_url;
                avatar_public_id = upload.public_id;
            }
        } catch (error) {
            throw new ApiError(400, 'Failed to upload avatar image')
        }
    }

    const result = await prisma.$transaction(async (tx) => {
        const staffRepos = new StaffRepository(tx)
        const workingHourRepos = new WorkingHoursRepository(tx)
        const serviceRepo = new ServiceRepository(tx)
        const staffServiceRepo = new StaffServiceRepository(tx)
        const updateData: any = {};
        if (input.fullName !== undefined) updateData.fullName = input.fullName;
        if (input.timezone !== undefined) updateData.timezone = input.timezone;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.isDeleted !== undefined) updateData.isDeleted = input.isDeleted;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (avatar_public_id !== undefined) updateData.avatar_public_id = avatar_public_id;
        if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber

        const staff = await staffRepos.updateById(input.id, updateData)

        if (input.services !== undefined) {
            const uniqueServiceIds = [...new Set(input.services)];
        
            if (uniqueServiceIds.length > 0) {
                const validServices = await tx.service.findMany({
                    where: {
                        id: { in: uniqueServiceIds }
                    },
                    select: { id: true }
                });
        
                const validIds = validServices.map(s => s.id);
        
                const invalidIds = uniqueServiceIds.filter(
                    id => !validIds.includes(id)
                );
        
                if (invalidIds.length > 0) {
                    throw new ApiError(400, ServiceError.SERVICE_IS_NOT_EXIST);
                }
            }
        
            await tx.staffService.deleteMany({
                where: { staffId: staff.id }
            });
        
            if (uniqueServiceIds.length > 0) {
                await tx.staffService.createMany({
                    data: uniqueServiceIds.map(serviceId => ({
                        staffId: staff.id,
                        serviceId
                    }))
                });
            }
        }

        if (input.workingHours && input.workingHours.length > 0) {
            await tx.workingHour.deleteMany({
                where: { staffId: staff.id },
            });
            
            await tx.workingHour.createMany({
                data: input.workingHours.map((wh) => ({
                    staffId: staff.id,
                    day: wh.day,
                    startTime: DateTimeStandardizer.normalizeVNHHmmToUTC(wh.startTime),
                    endTime: DateTimeStandardizer.normalizeVNHHmmToUTC(wh.endTime),
                }))
            });
        }

        const workingHours = await workingHourRepos.findManyWorkingHour(staff.id)
        const services = await staffServiceRepo.getAllServicesOfStaff(staff.id)


        return {
            ...staff,
            workingHours,
            services
        };
    });

    return result;
};