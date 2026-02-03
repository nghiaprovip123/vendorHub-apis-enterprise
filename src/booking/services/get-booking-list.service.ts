import { prisma } from "@/lib/prisma"
import {  parseISO, startOfDay } from "date-fns"
import { GetBookingListDto } from "@/booking/dto/booking.validation"
import * as z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"
import { BookingRepository } from "@/booking/repositories/booking.repository"

type getBookingList = z.infer< typeof GetBookingListDto >

export const getBookingListService = async ( input: getBookingList ) => {
    const { 
      startDate,
      endDate
     } = input

     const batchStartDate = startOfDay(new Date(`${startDate}`))
     const batchEndDate   = startOfDay(new Date(`${endDate}`))
 
     if (batchStartDate >= batchEndDate) {
       throw new Error(BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID)
     }
     
     const service = await prisma.$transaction(
      async (tx) => {
        const bookingRepo = new BookingRepository(tx)
        const getList = await bookingRepo.getBookingBatch(
          batchStartDate,
          batchEndDate
        )

        const total = await  bookingRepo.countBookingBatch(
          batchStartDate,
          batchEndDate
        )

        return { 
          bookingList : getList,
          total
         }
      }
     )
    return service
  }