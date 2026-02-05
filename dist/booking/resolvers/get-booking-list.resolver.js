"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetBookingList = void 0;
const get_booking_list_service_1 = require("../../booking/services/get-booking-list.service");
const getBookingList = async (_, args, ctx) => {
    try {
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
