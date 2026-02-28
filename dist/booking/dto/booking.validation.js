"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStaffByBookingRequestDto = exports.GetBookingListDto = exports.UpdateBookingDto = exports.CreateBookingDto = void 0;
const zod_1 = __importDefault(require("zod"));
const booking_error_1 = require("../../common/utils/error/booking.error");
const staff_error_1 = require("../../common/utils/error/staff.error");
exports.CreateBookingDto = zod_1.default.object({
    serviceId: zod_1.default.string(),
    staffId: zod_1.default.string().optional(),
    day: zod_1.default.string(),
    startTime: zod_1.default.string(),
    endTime: zod_1.default.string(),
    customerName: zod_1.default.string(),
    customerPhone: zod_1.default.string(),
    customerEmail: zod_1.default.string(),
    notes: zod_1.default.string().optional()
});
exports.UpdateBookingDto = zod_1.default.object({
    id: zod_1.default.string(),
    serviceId: zod_1.default.string().optional(),
    staffId: zod_1.default.string().optional(),
    day: zod_1.default.string().optional(),
    startTime: zod_1.default.string().optional(),
    endTime: zod_1.default.string().optional(),
    customerName: zod_1.default.string().optional(),
    customerPhone: zod_1.default.string().optional(),
    customerEmail: zod_1.default.string().optional(),
    notes: zod_1.default.string().optional()
});
exports.GetBookingListDto = zod_1.default.object({
    staffId: zod_1.default.string().optional(),
    startDate: zod_1.default.string(booking_error_1.BookingError.BOOKING_LIST_MISSING_START_DATE_INFORMATION),
    endDate: zod_1.default.string(booking_error_1.BookingError.BOOKING_LIST_MISSISING_END_DATE_INFORMATION)
});
exports.assignStaffByBookingRequestDto = zod_1.default.object({
    bookingId: zod_1.default.string(booking_error_1.BookingError.BOOKING_VIEW_DETAIL_MISSING_BOOKING_ID),
    staffId: zod_1.default.string(staff_error_1.StaffError.MISSING_STAFF_ID_ERROR)
});
