import { pubsub, EVENT } from '@/pubsub/pubsub'

export const bookingSubscription = {
  Subscription: {
    bookingStatusChanged: {
      subscribe: () =>
        pubsub.asyncIterator([EVENT.BOOKING_STATUS_CHANGED]),
    },
  },
}
