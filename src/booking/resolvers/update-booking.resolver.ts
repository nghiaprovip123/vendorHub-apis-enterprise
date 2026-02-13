import { prisma } from "@/lib/prisma"
import * as z from "zod"
import { BookingStatus, Prisma } from "@prisma/client"
import { UpdateBookingDto } from "@/booking/dto/booking.validation"
import ApiError from "@/common/utils/ApiError.utils"

const updateBooking = async (
    _: unknown,
    args: { input: any },
    ctx: any
  ) => {
    const {
      id,
      serviceId,
      staffId,
      day,
      startTime,
      endTime,
      customerName,
      customerPhone,
      customerEmail,
      notes
    } = args.input
  
    const existingBooking = await prisma.booking.findUnique({
      where: { id }
    })
  
    if (!existingBooking) {
      throw new ApiError(404, "Booking not found")
    }
  
    if (
      existingBooking.status === BookingStatus.CANCELLED ||
      existingBooking.status === BookingStatus.NO_SHOW ||
      existingBooking.status === BookingStatus.COMPLETED
    ) {
      throw new ApiError(
        400,
        "Cannot update booking with status CANCELLED, NO_SHOW or COMPLETED"
      )
    }
  
    const updateData: Prisma.BookingUpdateInput = {}

    if (customerName !== undefined)
      updateData.customerName = customerName
    
    if (customerPhone !== undefined)
      updateData.customerPhone = customerPhone
    
    if (customerEmail !== undefined)
      updateData.customerEmail = customerEmail
    
    if (notes !== undefined)
      updateData.notes = notes
    
    if (serviceId !== undefined) {
      updateData.bookingService = {
        connect: { id: serviceId }
      }
    }
    
    if (staffId !== undefined) {
      updateData.bookingStaff = {
        connect: { id: staffId }
      }
    }
    
    if (day !== undefined || startTime !== undefined || endTime !== undefined) {
        const slotUpdate: any = {}
      
        if (day !== undefined) slotUpdate.day = day
        if (startTime !== undefined) slotUpdate.startTime = startTime
        if (endTime !== undefined) slotUpdate.endTime = endTime
      
        updateData.slot = {
          update: slotUpdate
        }
    }
      
    
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData
    })
    return updatedBooking    
}
 
export const UpdateBooking = {
    Mutation : {
        updateBooking
    }
}