import { pubsub, EVENT } from "@/pubsub/pubsub"

export const Subscription = {
  bookingStatusChanged: {
    subscribe: () => pubsub.asyncIterator([EVENT.BOOKING_STATUS_CHANGED]),
  },
}