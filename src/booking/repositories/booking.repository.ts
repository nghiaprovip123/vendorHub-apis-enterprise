import { Prisma, PrismaClient, BookingStatus } from "@prisma/client"

type PrismaProvider = PrismaClient | Prisma.TransactionClient 

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
    }}