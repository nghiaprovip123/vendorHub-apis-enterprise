import { deleteStaffService } from "@/staff/services/delete-stafff.service"

const deleteStaff = async (
  _: unknown,
  args: { input: any },
  ctx: any
) => {
  try {
    const result = await deleteStaffService(args.input)
    return {
      success: true,
      message: "Successfullt delete a Staff!"
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
