import { PubSub } from 'graphql-subscriptions'

export const pubsub = new PubSub()
export const EVENT = {
    BOOKING_STATUS_CHANGED: 'BOOKING_STATUS_CHANGED'
} 