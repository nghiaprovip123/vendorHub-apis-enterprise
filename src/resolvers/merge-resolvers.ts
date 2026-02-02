// resolvers/index.ts
// import { productResolver } from "./products.resolvers";
import { CreateStaff } from "../staff/resolvers/create-staff.resolver"
import { UpdateStaff } from "../staff/resolvers/update-staff.resolver"
import { DeleteStaff } from "../staff/resolvers/delete-staff.resolver"
import { ViewStaffList } from "../staff/resolvers/view-staff-list.resolver"
import { GetAvailableStaff } from "../staff/resolvers/get-available-staff.resolver"
import { CreateBookingResolver } from "../booking/resolvers/create-booking.resolver"
// import { AssignStaffByBookingRequest } from "./booking/assign-staff.resolver"
import { CancelBooking } from "../booking/resolvers/cancel-booking.resolver"
import { ViewBookingDetail } from "../booking/resolvers/view-booking-detail.resolver"
import { GetBookingList } from "../booking/resolvers/get-booking-list.resolver"
// import { GetBookingListInBackOfficeByMonth } from "./booking/get-booking-list-by-month.resolver"
export const resolvers = [
  // productResolver,
  CreateStaff,
  UpdateStaff,
  DeleteStaff,
  ViewStaffList,
  GetAvailableStaff,
  CreateBookingResolver,
  // AssignStaffByBookingRequest,
  CancelBooking,
  ViewBookingDetail,
  GetBookingList,
  // GetBookingListInBackOfficeByMonth
];
