import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { CreateBookingDto } from "@/booking/dto/booking.validation"
import { BookingError } from "@/common/utils/error/booking.error"
import { parseISO, differenceInMinutes } from "date-fns"

type createBookingInput = z.infer< typeof CreateBookingDto >

export class CreateBooking {
    static async createBookingByCustomer ( input: createBookingInput ) {
            const {
                serviceId,
                staffId,
                day,
                startTime,
                endTime,
                customerName,
                customerPhone,
                customerEmail,
                notes
            } = input
    
            if (!serviceId) {
                throw new Error(BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION)
            }
            const service = await prisma.$transaction (
                async (tx) => {
                    const existingService = await tx.service.findUnique(
                        {
                            where : { 
                                id: serviceId,
                                isDeleted : false,
                                isVisible: true
                             }
                        }
                    )
            
                    if (!existingService) {
                        throw new Error(BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION)
                    }
             
                    if (!customerName || !customerPhone || !customerEmail) {
                        throw new Error(BookingError.BOOKING_CREATION_MISSING_CUSTOMER_INFORMATION)
                    }
            
                    const bookingStartDate = parseISO(`${day}T${startTime}`);
                    const bookingEndDate = parseISO(`${day}T${endTime}`);
                    const bookingDate = parseISO(`${day}T00:00:00.000`)
                    const now = new Date()
    
                    if (bookingStartDate < now) {
                        throw new Error(BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID)
                    }
    
                    if (bookingEndDate < bookingStartDate) {
                        throw new Error(BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID)
                    }
    
                    const duration = differenceInMinutes(bookingEndDate, bookingStartDate)
            
                    const overlapBookingHour = await tx.booking.findFirst(
                        {
                            where : {
                                staffId : staffId,
                                status : {
                                    in : ['CONFIRMED', 'PENDING']
                                },
                                OR : [
                                    {
                                        slot : {
                                            is : {
                                                startTime : {
                                                    lte : bookingEndDate
                                                }
                                            }
                                        }
                                    },
                                    {
                                        slot : {
                                            is : {
                                                endTime : {
                                                    gte : bookingStartDate
                                                }
                                            }
                                        }
                                    }
                                ],
                                AND : [
                                    {
                                        slot : {
                                            is : {
                                                startTime: { lt: bookingEndDate },
                                                endTime: { gt: bookingStartDate },
                                            }
                                        }
                                    },
                                ]
                            }
                        }
                    )
    
                    if (overlapBookingHour) {
                        throw new Error(BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION)
                    }
    
                    const createBooking = await tx.booking.create({
                        data: {
                          serviceId,
                          staffId,
                          customerName,
                          customerPhone,
                          customerEmail,
                          notes,
                          status: 'PENDING',
                          slot: {
                            set: {
                              startTime: bookingStartDate,
                              endTime: bookingEndDate,
                              durationInMinutes: duration,
                              day: bookingDate
                            }
                          }
                        },
                      })
                      
                    return createBooking
                }
            )
            return service
    }
}


