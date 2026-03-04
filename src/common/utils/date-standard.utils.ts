import { fromZonedTime, toZonedTime } from "date-fns-tz"

export const VN_TIMEZONE = "Asia/Ho_Chi_Minh"

export function vnToUtc(dateTime: string) {
  return fromZonedTime(dateTime, VN_TIMEZONE)
}

export class DateTimeStandardizer {

  // Extract HH:mm từ Date UTC
  static toHHmm(date: Date) {
    const h = date.getUTCHours().toString().padStart(2, "0")
    const m = date.getUTCMinutes().toString().padStart(2, "0")
    return `${h}:${m}`
  }

  // Convert HH:mm VN → HH:mm UTC
  static normalizeVNHHmmToUTC(hhmm: string) {

    const fakeLocalDate = `2026-01-01T${hhmm}:00`

    const utcDate = fromZonedTime(fakeLocalDate, VN_TIMEZONE)

    return this.toHHmm(utcDate)
  }

  static normalizeUTCHHmmToVN(hhmm: string) {
    const fakeUTCDate = new Date(`2026-01-01T${hhmm}:00Z`)
    const vnDate = toZonedTime(fakeUTCDate, VN_TIMEZONE)

    const h = vnDate.getHours().toString().padStart(2, "0")
    const m = vnDate.getMinutes().toString().padStart(2, "0")

    return `${h}:${m}`
  }
}
