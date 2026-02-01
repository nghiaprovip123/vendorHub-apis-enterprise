import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { CreateBookingDto } from "@/booking/dto/booking.validation"
import { BookingError } from "@/common/utils/error/booking.error"
import { parseISO, differenceInMinutes } from "date-fns"
import { ServiceRepository } from "@/service/repositories/service.repository"
import { BookingRepository } from "@/booking/repositories/booking.repository"
import { BookingStatus } from "@prisma/client"


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
                    const serviceRepo = new ServiceRepository(tx)
                    const bookingRepo = new BookingRepository(tx)
                    const existingService = await serviceRepo.findAvailableService(serviceId)
            
                    if (!existingService) {
                        throw new Error(BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE)
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
            
                    const overlapBookingHour = await bookingRepo.checkOverlapWorkingHour(
                        bookingStartDate,
                        bookingEndDate,
                        staffId,
                        [
                            BookingStatus.CONFIRMED,
                            BookingStatus.PENDING
                        ]
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

    static async createBookingInBackOffice ( input: createBookingInput ) {

        const {
            serviceId,
            staffId,
            startTime,
            endTime,
            day,
            customerName,
            customerEmail,
            customerPhone
        } = input

        if (!serviceId) {
            throw new Error(BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION)
        }

        if (!staffId) {
            throw new Error(BookingError.BOOKING_CREATION_MISSING_SERVICE_INFORMATION)
        }

        const service = await prisma.$transaction(
            async (tx) => {
                const verifyService = await tx.service.findFirst(
                    {
                        where : {
                            id : serviceId
                        }
                    }
                )
                if (!verifyService) {
                    throw new Error(BookingError.BOOKING_CREATION_SERVICE_NOT_AVAILABLE)
                }

                const verifyStaff = await tx.staff.findFirst(
                    {
                        where : {
                            id : staffId
                        }
                    }
                )
                
                if (!verifyStaff) {
                    throw new Error(BookingError.BOOKING_CREATION_STAFF_NOT_AVAILABLE)
                }

                const bookingStartDate = parseISO(`${day}T${startTime}`);
                const bookingEndDate = parseISO(`${day}T${endTime}`);
                const now = new Date();
                const bookingDate = parseISO(`${day}T00:00:00.000`);
                const duration = differenceInMinutes(bookingEndDate, bookingStartDate)

                if (bookingStartDate < now) {
                    throw new Error(BookingError.BOOKING_CREATION_BOOKING_START_DATE_INVALID)
                }

                if (bookingStartDate > bookingEndDate) {
                    throw new Error(BookingError.BOOKING_CREATION_BOOKING_END_DATE_INVALID)
                }

                const overlapBookingHour = await tx.booking.findFirst(
                    {
                        where : {
                            staffId : staffId,
                            status : {
                                in : ['COMPLETED', 'CONFIRMED', 'PENDING']
                            },
                            OR : [
                                {
                                    slot : {
                                        is : {
                                            startTime : {
                                                lte : bookingEndDate
                                            },
                                            endTime : {
                                                gte : bookingEndDate
                                            }                                                                                    }
                                    }
                                },
                                {
                                    slot : {
                                        is : {
                                            endTime : {
                                                gte : bookingStartDate
                                            },
                                            startTime : {
                                                lte : bookingStartDate
                                            }
                                        }
                                    }
                                }
                            ],
                            AND : [
                                {
                                    slot : {
                                        is : {
                                            startTime : {
                                                gte : bookingStartDate
                                            },
                                            endTime : {
                                                lte : bookingEndDate
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                )
                
                if (overlapBookingHour) {
                    throw new Error(BookingError.BOOKING_CREATION_BOOKING_OVERLAP_CONFLICTION)
                }

                const createBooking = await tx.booking.create(
                    {
                        data : {
                            serviceId : serviceId,
                            staffId : staffId,
                            customerEmail : customerEmail,
                            customerPhone : customerPhone,
                            customerName : customerName,
                            status : 'PENDING',
                            slot : {
                                day : bookingDate,
                                startTime : bookingStartDate,
                                endTime : bookingEndDate,
                                durationInMinutes : duration
                            }
                        }
                    }
                )

                return createBooking                
            }
        )
        return service
    }
}


