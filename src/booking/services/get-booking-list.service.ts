import { prisma } from "@/lib/prisma"
import {  parseISO, startOfDay } from "date-fns"
import { GetBookingListDto } from "@/booking/dto/booking.validation"
import * as z from "zod"
import { BookingError } from "@/common/utils/error/booking.error"

type getBookingList = z.infer< typeof GetBookingListDto >

export const getBookingListService = async ( input: getBookingList ) => {
    const { 
      startDate,
      endDate
     } = input

     const batchStartDate = startOfDay(new Date(`${startDate}`))
     const batchEndDate   = startOfDay(new Date(`${endDate}`))
     const now = new Date()
     const todayUTC = new Date(Date.UTC(
       now.getUTCFullYear(),
       now.getUTCMonth(),
       now.getUTCDate()
     ))     
     if (batchStartDate >= batchEndDate) {
       throw new Error(BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID)
     }
     

     const getList = await prisma.booking.findMany(
      {
        where : {
          slot : {
            is : {
              day : {
                gte : batchStartDate,
                lt : batchEndDate
              } 
            }
          }
        }
      }
     )

     console.log(getList)

     const total = await prisma.booking.count(
      {
        where : {
          slot : {
            is : {
              day : {
                gte : batchStartDate,
                lt : batchEndDate
              } 
            }
          }
        }
      }
     )
     return {
      bookingList: getList,
      total
    }
  }