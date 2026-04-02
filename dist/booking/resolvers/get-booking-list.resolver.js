"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBookingList = void 0;
const get_booking_list_service_1 = require("../../booking/services/get-booking-list.service");
const auth_graph_guard_1 = require("../../common/guards/auth-graph.guard");
const getBookingList = async (_, args, ctx) => {
    try {
        (0, auth_graph_guard_1.requireAuth)(ctx);
        const result = await (0, get_booking_list_service_1.getBookingListService)(args.input);
        return result;
    }
    catch (error) {
        throw error;
    }
};
exports.GetBookingList = {
    Query: {
        getBookingList
    }
};
