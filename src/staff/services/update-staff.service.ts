// staff/services/update-staff.service.ts
import { prisma } from "@/lib/prisma"
import { CloudinaryRest } from "@/common/utils/cloudinary-orchestration.utils"
import * as z from "zod"
import { updateStaffSchema } from "@/staff/dto/staffs.validation"

type UpdateStaffType = z.infer<typeof updateStaffSchema>

export const updateStaffService = async (input: UpdateStaffType) => {
    console.log('=== UPDATE STAFF SERVICE START ===');
    console.log('Input:', JSON.stringify(input, null, 2));

    const existingStaff = await prisma.staff.findUnique({
        where: { id: input.id }
    });

    if (!existingStaff) {
        throw new Error('KHÔNG TÌM THẤY NHÂN VIÊN');
    }

    let avatar_url: string | undefined = existingStaff.avatar_url || undefined;
    let avatar_public_id: string | undefined = existingStaff.avatar_public_id || undefined;

    if (input.avatar) {
        console.log('Processing avatar upload...');
        const file = await input.avatar;
        const stream = file.createReadStream();

        const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
        const folder = `${env}/staffs`;
        const public_id = `${input.id}/avatar`;

        if (existingStaff.avatar_public_id) {
            console.log('Overwriting existing avatar...');
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
            console.log('Avatar overwritten:', { avatar_url, avatar_public_id });
        } else {
            console.log('Uploading new avatar...');
            const upload = await CloudinaryRest.UploadImageToCloudinary(
                stream,
                {
                    folder,
                    public_id,
                    resource_type: "image",
                    contentType: file.mimetype || 'image/png',
                    filename: file.filename || 'avatar.png',
                }
            );
            avatar_url = upload.secure_url;
            avatar_public_id = upload.public_id;
            console.log('New avatar uploaded:', { avatar_url, avatar_public_id });
        }
    }

    const result = await prisma.$transaction(async (tx) => {
        console.log('Starting transaction...');

        const updateData: any = {};
        if (input.fullName !== undefined) updateData.fullName = input.fullName;
        if (input.timezone !== undefined) updateData.timezone = input.timezone;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.isDeleted !== undefined) updateData.isDeleted = input.isDeleted;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url;
        if (avatar_public_id !== undefined) updateData.avatar_public_id = avatar_public_id;

        console.log('Update data:', updateData);

        const staff = await tx.staff.update({
            where: { id: input.id },
            data: updateData,
        });

        console.log('Staff updated:', staff);

        let workingHours = [];
        if (input.workingHours && input.workingHours.length > 0) {
            console.log('Updating working hours...');

            await tx.workingHour.deleteMany({
                where: { staffId: staff.id },
            });

            workingHours = await Promise.all(
                input.workingHours.map((wh) =>
                    tx.workingHour.create({
                        data: {
                            staffId: staff.id,
                            day: wh.day,
                            startTime: wh.startTime,
                            endTime: wh.endTime,
                        },
                    })
                )
            );

            console.log('Working hours created:', workingHours);
        } else {
            workingHours = await tx.workingHour.findMany({
                where: { staffId: staff.id },
            });
            console.log('Existing working hours:', workingHours);
        }

        const finalResult = {
            ...staff,
            workingHours,
        };

        console.log('=== FINAL RESULT ===');
        console.log(JSON.stringify(finalResult, null, 2));
        console.log('=== UPDATE STAFF SERVICE END ===');

        return finalResult;
    });

    return result;
};