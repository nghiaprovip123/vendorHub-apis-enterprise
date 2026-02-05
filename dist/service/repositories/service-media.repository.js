"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceMediaRepository = void 0;
class ServiceMediaRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createMany(input) {
        return this.prisma.serviceMedia.createMany({
            data: input
        });
    }
    deleteByServiceId(serviceId) {
        return this.prisma.serviceMedia.deleteMany({
            where: { serviceId }
        });
    }
}
exports.ServiceMediaRepository = ServiceMediaRepository;
