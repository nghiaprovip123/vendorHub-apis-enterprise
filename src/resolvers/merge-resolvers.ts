// resolvers/index.ts
// import { productResolver } from "./products.resolvers";
import { CreateStaff } from "@/staff/resolvers/create-staff.resolver"
import { UpdateStaff } from "../staff/resolvers/update-staff.resolver"
import { DeleteStaff } from "../staff/resolvers/delete-staff.resolver"
import { ViewStaffList } from "../staff/resolvers/view-staff-list.resolver"
// import { GetAvailableStaff } from "../staff/resolvers/get-available-staff.resolver"
// import { CreateBookingByCustomer } from "./booking/create-booking.resolver"
// import { AssignStaffByBookingRequest } from "./booking/assign-staff.resolver"
// import { CancelBooking } from "./booking/cancel-booking.resolver"
// import { ViewBookingDetailInBackOffce } from "./booking/view-booking-detail.resolver"
// import { GetBookingListInBackOfficeByWeek } from "./booking/get-booking-list-by-week.resolver"
// import { GetBookingListInBackOfficeByMonth } from "./booking/get-booking-list-by-month.resolver"
export const resolvers = [
  // productResolver,
  CreateStaff,
  UpdateStaff,
  DeleteStaff,
  ViewStaffList,
  // GetAvailableStaff,
  // CreateBookingByCustomer,
  // AssignStaffByBookingRequest,
  // CancelBooking,
  // ViewBookingDetailInBackOffce,
  // GetBookingListInBackOfficeByWeek,
  // GetBookingListInBackOfficeByMonth
];
