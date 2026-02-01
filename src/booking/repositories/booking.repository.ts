import { Prisma, PrismaClient, BookingStatus } from "@prisma/client"

type PrismaProvider = PrismaClient | Prisma.TransactionClient 

type CreateBookingData = {
    serviceId: string
    staffId?: string
    customerName: string
    customerPhone: string
    customerEmail: string
    notes?: string
    status: BookingStatus
    slot: {
      startTime: Date
      endTime: Date
      durationInMinutes: number,
      day : Date
    }
  }
  

export class BookingRepository {
    constructor (private readonly prisma : PrismaProvider) {}

    async checkOverlapWorkingHour (
        bookingStartDate : Date,
        bookingEndDate : Date,
        staffId? : string,
        statuses? : BookingStatus[]
    ) {
        return this.prisma.booking.findFirst(
            {
                where : {
                    staffId : staffId,
                    status : {
                        in : statuses
                    },
                    OR : [
                        {
                            slot : {
                                is : {
                                    startTime : {
                                        lte : bookingEndDate,
                                    }, 
                                    endTime : {
                                        gte : bookingEndDate
                                    }
                                }
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
    }
    
    async createBooking (
        data : CreateBookingData
    ) {
        return this.prisma.booking.create({
            data: {
              serviceId: data.serviceId,
              staffId: data.staffId,
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              customerEmail: data.customerEmail,
              notes: data.notes,
              status: data.status,
              slot: {
                set: {
                  startTime: data.slot.startTime,
                  endTime: data.slot.endTime,
                  durationInMinutes: data.slot.durationInMinutes,
                  day: data.slot.day
                },
              },
            },
          })
    }
}