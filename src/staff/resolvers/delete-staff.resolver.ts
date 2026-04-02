import { requireAuth } from "@/common/guards/auth-graph.guard"
import { deleteStaffService } from "@/staff/services/delete-staff.service"

const deleteStaff = async (
  _: unknown,
  args: { input: any },
  ctx: any
) => {
  try {
    requireAuth(ctx)

    const result = await deleteStaffService(args.input)
    return {
      success: true,
      message: "SUCCESSFULLY DELETE A STAFF"
    }
  }
    catch(error: any) {
      throw error
    }
  }

export const DeleteStaff = {
  Mutation: {
    deleteStaff,
  },
}
