// staff/dto/staffs.validation.ts
import { z } from 'zod';

export const createWorkingHourSchema = z.object({
  day: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

export const createStaffSchema = z.object({
    avatar: z.any().optional(), 
    fullName: z.string().min(2).max(100),
    timezone: z.string(),
    isActive: z.boolean().optional().default(true),
    isDeleted: z.boolean().optional().default(false),
    workingHours: z.array(createWorkingHourSchema).min(1),
});
  
export const updateStaffSchema = z.object({
    id: z.string(),
    avatar: z.any().optional(), 
    fullName: z.string().min(2).max(100).optional(),
    timezone: z.string().optional(),
    isActive: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    workingHours: z.array(createWorkingHourSchema).optional(),
});

export const deleteStaffSchema = z.object({
    id: z.string(),
    public_id: z.string(),
});