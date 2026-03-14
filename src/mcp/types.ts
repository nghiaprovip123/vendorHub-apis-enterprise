/* src/mcp/types.ts - Shared MCP types for VendorHub MCP Server */

// Import Prisma types for type-safety
import { BookingStatus, Prisma } from '@prisma/client';
import { z } from 'zod';

// Core MCP interfaces (extensible)
export interface McpContext {
  prisma: any;
  logger: any;
}

// Tool input/output for getAvailableStaff
export const GetAvailableStaffInputSchema = z.object({
  serviceId: z.string().describe('Service ObjectId'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).describe('HH:mm'),
  durationMinutes: z.number().min(1).max(480).describe('Slot duration'),
  limit: z.number().min(1).max(50).optional().default(10),
});

export type GetAvailableStaffInput = z.infer<typeof GetAvailableStaffInputSchema>;

export interface AvailableStaff {
  id: string;
  fullName: string | null;
  avatar_url: string | null;
  timezone: string | null;
  services: string[]; // Service IDs
}

export const GetAvailableStaffOutputSchema = z.array(
  z.object({
    id: z.string(),
    fullName: z.string().nullable(),
    avatar_url: z.string().nullable(),
    timezone: z.string().nullable(),
    services: z.array(z.string()),
  })
);

// Resource params for booking-list
export const BookingListParamsSchema = z.object({
  serviceId: z.string().optional(),
  status: z.nativeEnum(BookingStatus).optional(),
  limit: z.number().min(1).max(100).optional().default(20),
  cursor: z.string().optional().describe('Last booking ID for pagination'),
});

export type BookingListParams = z.infer<typeof BookingListParamsSchema>;

export interface McpBookingListItem {
  id: string;
  bookingCode: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: BookingStatus;
  slot: {
    day: string;
    startTime: string;
    endTime: string;
  };
  createdAt: string;
  staff: { fullName: string | null } | null;
  service: { name: string | null } | null;
}

