// ██████████████████████████████████████████████████████████████████████
// █                            STAFF DOMAIN                            █
// ██████████████████████████████████████████████████████████████████████
import { CreateStaff } from "../staff/resolvers/create-staff.resolver"
import { UpdateStaff } from "../staff/resolvers/update-staff.resolver"
import { DeleteStaff } from "../staff/resolvers/delete-staff.resolver"
import { ViewStaffList } from "../staff/resolvers/get-staff-list.resolver"
import { GetStaffDetail } from "../staff/resolvers/get-staff-detail.resolver"


// ██████████████████████████████████████████████████████████████████████
// █                           BOOKING DOMAIN                           █
// ██████████████████████████████████████████████████████████████████████
import { GetAvailableStaff } from "../staff/resolvers/get-available-staff.resolver"
import { CreateBookingResolver } from "../booking/resolvers/create-booking.resolver"
import { AssignStaffByBookingRequest } from "../booking/resolvers/assign-staff.resolver"
import { CancelBooking } from "../booking/resolvers/cancel-booking.resolver"
import { ViewBookingDetail } from "../booking/resolvers/get-booking-detail.resolver"
import { GetBookingList } from "../booking/resolvers/get-booking-list.resolver"
import { bookingSubscription } from '../booking/subscription/booking.subscription'
import { UpdateBooking } from "../booking/resolvers/update-booking.resolver"


// ██████████████████████████████████████████████████████████████████████
// █                           SERVICE DOMAIN                           █
// ██████████████████████████████████████████████████████████████████████
import { CreateService } from "../service/resolvers/create-service.resolver"
import { ViewServiceList } from "../service/resolvers/view-service-list.resolver"
import { UpdateService } from "../service/resolvers/update-service.resolver"
import { ViewServiceDetail } from "../service/resolvers/view-service-detail.resolver"
import { DeleteService } from "../service/resolvers/delete-service.resolver"
import { ViewCategoryList } from "../service/resolvers/view-category-list.resolver"

// ══════════════════════════════════════════════════════════════════════
// 🚀 GRAPHQL RESOLVER REGISTRY
// ══════════════════════════════════════════════════════════════════════
export const resolvers = [
  // ───────────────────────── STAFF ─────────────────────────
  CreateStaff,
  UpdateStaff,
  DeleteStaff,
  ViewStaffList,
  GetStaffDetail,

  // ──────────────────────── BOOKING ────────────────────────
  GetAvailableStaff,
  CreateBookingResolver,
  AssignStaffByBookingRequest,
  CancelBooking,
  ViewBookingDetail,
  GetBookingList,
  bookingSubscription,
  UpdateBooking,

  // ──────────────────────── SERVICE ────────────────────────
  CreateService,
  ViewServiceList,
  UpdateService,
  ViewServiceDetail,
  DeleteService,
  ViewCategoryList
]
