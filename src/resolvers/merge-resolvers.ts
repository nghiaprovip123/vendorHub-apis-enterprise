// ██████████████████████████████████████████████████████████████████████
// █                            STAFF DOMAIN                            █
// ██████████████████████████████████████████████████████████████████████
import { CreateStaff } from "../staff/resolvers/create-staff.resolver"
import { UpdateStaff } from "../staff/resolvers/update-staff.resolver"
import { DeleteStaff } from "../staff/resolvers/delete-staff.resolver"
import { ViewStaffList } from "../staff/resolvers/view-staff-list.resolver"


// ██████████████████████████████████████████████████████████████████████
// █                           BOOKING DOMAIN                           █
// ██████████████████████████████████████████████████████████████████████
import { GetAvailableStaff } from "../staff/resolvers/get-available-staff.resolver"
import { CreateBookingResolver } from "../booking/resolvers/create-booking.resolver"
import { AssignStaffByBookingRequest } from "../booking/resolvers/assign-staff.resolver"
import { CancelBooking } from "../booking/resolvers/cancel-booking.resolver"
import { ViewBookingDetail } from "../booking/resolvers/view-booking-detail.resolver"
import { GetBookingList } from "../booking/resolvers/get-booking-list.resolver"
import { bookingSubscription } from '@/booking/subscription/booking.subscription'


// ██████████████████████████████████████████████████████████████████████
// █                           SERVICE DOMAIN                           █
// ██████████████████████████████████████████████████████████████████████
import { CreateService } from "../service/resolvers/create-service.resolver"
import { ViewServiceList } from "../service/resolvers/view-service-list.resolver"
import { UpdateService } from "../service/resolvers/update-service.resolver"
import { ViewServiceDetail } from "../service/resolvers/view-service-detail.resolver"
import { DeleteService } from "../service/resolvers/delete-service.resolver"

// ══════════════════════════════════════════════════════════════════════
// 🚀 GRAPHQL RESOLVER REGISTRY
// ══════════════════════════════════════════════════════════════════════
export const resolvers = [
  // ───────────────────────── STAFF ─────────────────────────
  CreateStaff,
  UpdateStaff,
  DeleteStaff,
  ViewStaffList,

  // ──────────────────────── BOOKING ────────────────────────
  GetAvailableStaff,
  CreateBookingResolver,
  AssignStaffByBookingRequest,
  CancelBooking,
  ViewBookingDetail,
  GetBookingList,
  bookingSubscription,

  // ──────────────────────── SERVICE ────────────────────────
  CreateService,
  ViewServiceList,
  UpdateService,
  ViewServiceDetail,
  DeleteService
]
