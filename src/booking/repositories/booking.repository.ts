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

    async findBookingById(id: string) {
        return this.prisma.booking.findFirst({
          where: { id }
        })
      }

    async getBookingBatch (
        startDate: Date,
        endDate: Date
    ) {
        return this.prisma.booking.findMany(
            {
                where : {
                    slot : {
                        is : {
                            day : {
                                gte : startDate,
                                lt : endDate
                            }
                        }
                    }
                }
            }
        )
    }
    
    async countBookingBatch (
        startDate: Date,
        endDate: Date
    ) {
        return this.prisma.booking.count(
            {
                where : {
                    slot : {
                        is : { 
                            day : {
                                gte : startDate,
                                lt : endDate
                            }
                        }
                    }
                }
            }
        )
    }

    async findBookingByIdAndStatus (
        id: string,
        status: BookingStatus
    ) {
        return this.prisma.booking.findFirst(
            {
                where : {
                    id: id,
                    status: status
                }
            }
        )
    }

    async assignStaffIntoBooking (
        staffId: string,
        bookingId: string
    ) {
        return this.prisma.booking.update(
            {
                where : {
                    id : bookingId
                },
                data : {
                    staffId: staffId
                }
            }
        )
    }
    
    async countByServiceId(serviceId: string) {
        return this.prisma.booking.count({
        where: { serviceId }
        })
    }

    async findUpcomingConfirmedBookings(now: Date, minutes: number) {
        const threshold = new Date(now.getTime() + minutes * 60 * 1000)
      
        return this.prisma.booking.findMany({
          where: {
            status: BookingStatus.CONFIRMED,
            slot: {
              is: {
                startTime: {
                  gt: now,
                  lte: threshold,
                },
              },
            },
          },
          select: {
            id: true,
          },
        })
    }

    async findInProgressBookings (now: Date) {
        return this.prisma.booking.findMany(
            {
                where : {
                    slot : {
                        is : {
                            startTime : {
                                lte : now
                            },
                            endTime : {
                                gte : now
                            }
                        }
                    }
                    
                }
            }
        )
    }
      

    async updateStatus(id: string, status: BookingStatus) {
        return this.prisma.booking.update({
          where: { id },
          data: { status },
        })
    }
}