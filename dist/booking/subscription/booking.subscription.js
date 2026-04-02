"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingSubscription = void 0;
const pubsub_1 = require("@/pubsub/pubsub");
exports.bookingSubscription = {
    Subscription: {
        bookingStatusChanged: {
            subscribe: () => pubsub_1.pubsub.asyncIterator([pubsub_1.EVENT.BOOKING_STATUS_CHANGED]),
        },
    },
};
