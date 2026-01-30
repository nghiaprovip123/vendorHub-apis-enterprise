"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
// resolvers/index.ts
// import { productResolver } from "./products.resolvers";
const create_staff_resolver_1 = require("@/staff/resolvers/create-staff.resolver");
const update_staff_resolver_1 = require("../staff/resolvers/update-staff.resolver");
const delete_staff_resolver_1 = require("../staff/resolvers/delete-staff.resolver");
const view_staff_list_resolver_1 = require("../staff/resolvers/view-staff-list.resolver");
const get_available_staff_resolver_1 = require("../staff/resolvers/get-available-staff.resolver");
const create_booking_resolver_1 = require("@/booking/resolvers/create-booking.resolver");
// import { AssignStaffByBookingRequest } from "./booking/assign-staff.resolver"
// import { CancelBooking } from "./booking/cancel-booking.resolver"
// import { ViewBookingDetailInBackOffce } from "./booking/view-booking-detail.resolver"
// import { GetBookingListInBackOfficeByWeek } from "./booking/get-booking-list-by-week.resolver"
// import { GetBookingListInBackOfficeByMonth } from "./booking/get-booking-list-by-month.resolver"
exports.resolvers = [
    // productResolver,
    create_staff_resolver_1.CreateStaff,
    update_staff_resolver_1.UpdateStaff,
    delete_staff_resolver_1.DeleteStaff,
    view_staff_list_resolver_1.ViewStaffList,
    get_available_staff_resolver_1.GetAvailableStaff,
    create_booking_resolver_1.CreateBookingByCustomer,
    // AssignStaffByBookingRequest,
    // CancelBooking,
    // ViewBookingDetailInBackOffce,
    // GetBookingListInBackOfficeByWeek,
    // GetBookingListInBackOfficeByMonth
];
