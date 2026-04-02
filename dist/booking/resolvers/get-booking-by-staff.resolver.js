"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBookingByStaff = void 0;
const get_booking_by_staff_service_1 = require("@/booking/services/get-booking-by-staff.service");
const auth_graph_guard_1 = require("@/common/guards/auth-graph.guard");
const TZ = "Asia/Ho_Chi_Minh";
const getBookingByStaff = async (_, args, ctx) => {
    (0, auth_graph_guard_1.requireAuth)(ctx);
    const result = await (0, get_booking_by_staff_service_1.GetBookingByStaffService)(args.input);
    return result;
};
exports.GetBookingByStaff = {
    Query: {
        getBookingByStaff
    }
};
