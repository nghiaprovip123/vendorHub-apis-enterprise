import { GraphQLUpload } from 'graphql-upload-minimal';
import { createStaffService } from '@/staff/services/create-staff.service'
import { requireAuth } from '@/common/guards/auth-graph.guard';

const createStaff = async(
  _: unknown,
  args: { input: any },
  ctx: any
) => {
  try {
    requireAuth(ctx)
    const createStaff = await createStaffService(args.input)
    return createStaff;
  } catch (error: any) {
    throw error
  }
}

export const CreateStaff = {
Upload: GraphQLUpload,
  Mutation: {
    createStaff
  }
};
