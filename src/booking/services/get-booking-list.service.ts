import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import { GetBookingListDto } from "@/booking/dto/booking.validation";
import * as z from "zod";
import { BookingError } from "@/common/utils/error/booking.error";
import { BookingRepository } from "@/booking/repositories/booking.repository";
import ApiError from "@/common/utils/ApiError.utils";

const TZ = "Asia/Ho_Chi_Minh";

type GetBookingList = z.infer<typeof GetBookingListDto>;

export const getBookingListService = async (
  input: GetBookingList
) => {
  const { startDate, endDate } = input;

  if (!startDate || !endDate) {
    throw new ApiError(
      400,
      BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID
    );
  }

  const vnStart = startOfDay(new Date(startDate));
  const vnEnd = endOfDay(new Date(endDate));

  const utcStart = fromZonedTime(vnStart, TZ);
  const utcEnd = fromZonedTime(vnEnd, TZ);

  if (utcStart >= utcEnd) {
    throw new ApiError(
      400,
      BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID
    );
  }

  return prisma.$transaction(async (tx) => {
    const bookingRepo = new BookingRepository(tx);

    const bookingList = await bookingRepo.getBookingBatch(
      utcStart,
      utcEnd
    );

    const total = await bookingRepo.countBookingBatch(
      utcStart,
      utcEnd
    );

    return { bookingList, total };
  });
};