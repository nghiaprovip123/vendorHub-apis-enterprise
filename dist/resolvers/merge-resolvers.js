"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = void 0;
// ██████████████████████████████████████████████████████████████████████
// █                            STAFF DOMAIN                            █
// ██████████████████████████████████████████████████████████████████████
const create_staff_resolver_1 = require("../staff/resolvers/create-staff.resolver");
const update_staff_resolver_1 = require("../staff/resolvers/update-staff.resolver");
const delete_staff_resolver_1 = require("../staff/resolvers/delete-staff.resolver");
const view_staff_list_resolver_1 = require("../staff/resolvers/view-staff-list.resolver");
// ██████████████████████████████████████████████████████████████████████
// █                           BOOKING DOMAIN                           █
// ██████████████████████████████████████████████████████████████████████
const get_available_staff_resolver_1 = require("../staff/resolvers/get-available-staff.resolver");
const create_booking_resolver_1 = require("../booking/resolvers/create-booking.resolver");
const assign_staff_resolver_1 = require("../booking/resolvers/assign-staff.resolver");
const cancel_booking_resolver_1 = require("../booking/resolvers/cancel-booking.resolver");
const view_booking_detail_resolver_1 = require("../booking/resolvers/view-booking-detail.resolver");
const get_booking_list_resolver_1 = require("../booking/resolvers/get-booking-list.resolver");
// ██████████████████████████████████████████████████████████████████████
// █                           SERVICE DOMAIN                           █
// ██████████████████████████████████████████████████████████████████████
const create_service_resolver_1 = require("../service/resolvers/create-service.resolver");
const view_service_list_resolver_1 = require("../service/resolvers/view-service-list-resolver");
const update_service_resolver_1 = require("../service/resolvers/update-service.resolver");
// ══════════════════════════════════════════════════════════════════════
// 🚀 GRAPHQL RESOLVER REGISTRY
// ══════════════════════════════════════════════════════════════════════
exports.resolvers = [
    // ───────────────────────── STAFF ─────────────────────────
    create_staff_resolver_1.CreateStaff,
    update_staff_resolver_1.UpdateStaff,
    delete_staff_resolver_1.DeleteStaff,
    view_staff_list_resolver_1.ViewStaffList,
    // ──────────────────────── BOOKING ────────────────────────
    get_available_staff_resolver_1.GetAvailableStaff,
    create_booking_resolver_1.CreateBookingResolver,
    assign_staff_resolver_1.AssignStaffByBookingRequest,
    cancel_booking_resolver_1.CancelBooking,
    view_booking_detail_resolver_1.ViewBookingDetail,
    get_booking_list_resolver_1.GetBookingList,
    // ──────────────────────── SERVICE ────────────────────────
    create_service_resolver_1.CreateService,
    view_service_list_resolver_1.ViewServiceList,
    update_service_resolver_1.UpdateService
];
