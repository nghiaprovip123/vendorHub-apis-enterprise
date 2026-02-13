"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EVENT = exports.pubsub = void 0;
const graphql_subscriptions_1 = require("graphql-subscriptions");
exports.pubsub = new graphql_subscriptions_1.PubSub();
exports.EVENT = {
    BOOKING_STATUS_CHANGED: 'BOOKING_STATUS_CHANGED'
};
