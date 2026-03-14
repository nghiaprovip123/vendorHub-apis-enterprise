"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeStandardizer = exports.VN_TIMEZONE = void 0;
exports.vnToUtc = vnToUtc;
const date_fns_tz_1 = require("date-fns-tz");
exports.VN_TIMEZONE = "Asia/Ho_Chi_Minh";
function vnToUtc(dateTime) {
    return (0, date_fns_tz_1.fromZonedTime)(dateTime, exports.VN_TIMEZONE);
}
class DateTimeStandardizer {
    // Extract HH:mm từ Date UTC
    static toHHmm(date) {
        const h = date.getUTCHours().toString().padStart(2, "0");
        const m = date.getUTCMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
    }
    // Convert HH:mm VN → HH:mm UTC
    static normalizeVNHHmmToUTC(hhmm) {
        const fakeLocalDate = `2026-01-01T${hhmm}:00`;
        const utcDate = (0, date_fns_tz_1.fromZonedTime)(fakeLocalDate, exports.VN_TIMEZONE);
        return this.toHHmm(utcDate);
    }
    static normalizeUTCHHmmToVN(hhmm) {
        const fakeUTCDate = new Date(`2026-01-01T${hhmm}:00Z`);
        const vnDate = (0, date_fns_tz_1.toZonedTime)(fakeUTCDate, exports.VN_TIMEZONE);
        const h = vnDate.getHours().toString().padStart(2, "0");
        const m = vnDate.getMinutes().toString().padStart(2, "0");
        return `${h}:${m}`;
    }
}
exports.DateTimeStandardizer = DateTimeStandardizer;
