import { getAllStaffService } from "@/staff/services/get-all-staff.service"
const getAllStaff = async (
    _: unknown,
    args : { input : any },
    ctx : any
) => {
    const result = await getAllStaffService()
    return result
}

export const GetAllStaff = {
    Query : {
        getAllStaff
    }
}