"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkingHoursRepository = void 0;
class WorkingHoursRepository {
    constructor(prisma = prisma) {
        this.prisma = prisma;
    }
    async createManyWorkingHour(data) {
        return this.prisma.workingHour.createMany({
            data,
        });
    }
    async deleteManyWorkingHour(staffId) {
        return this.prisma.workingHour.deleteMany({
            where: { staffId }
        });
    }
    async findManyWorkingHour(staffId) {
        return this.prisma.workingHour.findMany({
            where: { staffId },
        });
    }
    async getAcceptableWorkingHourbyBookingTime(day, startTime, endTime) {
        return this.prisma.workingHour.findMany({
            where: {
                day,
                startTime: { lte: startTime },
                endTime: { gte: endTime }
            },
            select: {
                staffId: true
            }
        });
    }
}
exports.WorkingHoursRepository = WorkingHoursRepository;
