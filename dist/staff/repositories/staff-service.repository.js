"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffServiceRepository = void 0;
class StaffServiceRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByStaffAndServices(staffId, serviceIds) {
        return this.prisma.staffService.findMany({
            where: {
                staffId,
                serviceId: { in: serviceIds }
            },
            select: {
                serviceId: true
            }
        });
    }
    async getAllServicesOfStaff(staffId) {
        return this.prisma.staffService.findMany({
            where: {
                staffId,
            },
            include: {
                service: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });
    }
    async attachServices(staffId, serviceIds) {
        if (serviceIds.length === 0)
            return;
        return this.prisma.staffService.createMany({
            data: serviceIds.map(serviceId => ({
                staffId,
                serviceId
            }))
        });
    }
    async deleteManyByStaffId(staffId) {
        return this.prisma.staffService.deleteMany({
            where: {
                staffId: staffId
            }
        });
    }
    async countByServiceId(serviceId) {
        return this.prisma.staffService.count({
            where: { serviceId }
        });
    }
}
exports.StaffServiceRepository = StaffServiceRepository;
