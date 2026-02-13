"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignStaffByBookingRequestService = void 0;
const prisma_1 = require("../../lib/prisma");
const client_1 = require("@prisma/client");
const booking_error_1 = require("../../common/utils/error/booking.error");
const staff_repository_1 = require("../../staff/repositories/staff.repository");
const staff_error_1 = require("../../common/utils/error/staff.error");
const booking_repository_1 = require("../../booking/repositories/booking.repository");
const ApiError_utils_1 = __importDefault(require("../../common/utils/ApiError.utils"));
const assignStaffByBookingRequestService = async (input) => {
    const staffRepo = new staff_repository_1.StaffRepository(prisma_1.prisma);
    const service = await prisma_1.prisma.$transaction(async (tx) => {
        const staffRepo = new staff_repository_1.StaffRepository(tx);
        const bookingRepo = new booking_repository_1.BookingRepository(tx);
        const findBookingInformation = await bookingRepo.findBookingByIdAndStatus(input.bookingId, client_1.BookingStatus.PENDING);
        if (!findBookingInformation) {
            throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_VIEW_DETAIL_BOOKING_NOT_EXISTS);
        }
        if (findBookingInformation.staffId) {
            throw new ApiError_utils_1.default(400, booking_error_1.BookingError.BOOKING_ALREADY_ASSIGNED_STAFF);
        }
        const findAvailableStaff = await staffRepo.findAvailableForAssignment(input.staffId, findBookingInformation.slot.day, findBookingInformation.slot.endTime, findBookingInformation.slot.startTime);
        if (!findAvailableStaff) {
            throw new ApiError_utils_1.default(204, staff_error_1.StaffError.NOT_FOUND_STAFF_ERROR);
        }
        const assignBookingInformation = await bookingRepo.assignStaffIntoBooking(findBookingInformation.id, input.staffId);
        return assignBookingInformation;
    });
};
exports.assignStaffByBookingRequestService = assignStaffByBookingRequestService;
