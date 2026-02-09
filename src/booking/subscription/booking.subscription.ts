import { pubsub, BOOKING_STATUS_CHANGED } from "@/pubsub/pubsub"

export const Subscription = {
  bookingStatusChanged: {
    subscribe: () => pubsub.asyncIterator([BOOKING_STATUS_CHANGED]),
  },
}