export class DateTimeStandardizer {
  static toHHmm(date: Date) {
    return date.toISOString().substring(11, 16) // "20:30"
  }
}
