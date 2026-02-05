"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
class ServiceRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAvailableService(id) {
        return this.prisma.service.findFirst({
            where: {
                id: id,
                isVisible: true,
                isDeleted: false,
            }
        });
    }
    async findManyExistingService(services) {
        return this.prisma.staffService.findMany({
            where: {
                id: {
                    in: services
                }
            },
            select: {
                id: true
            }
        });
    }
    async createService(categoryId, name, description, currency, duration, pricing) {
        return this.prisma.service.create({
            data: {
                categoryId,
                name,
                description,
                currency,
                duration,
                pricing,
            }
        });
    }
    async getServiceList(skip, take) {
        return this.prisma.service.findMany({
            skip,
            take
        });
    }
    async countTotal() {
        return this.prisma.service.count();
    }
    findById(id) {
        return this.prisma.service.findUnique({ where: { id } });
    }
    updateById(id, data) {
        return this.prisma.service.update({
            where: { id },
            data
        });
    }
    findWithMedias(id) {
        return this.prisma.service.findUnique({
            where: { id },
            include: { medias: { orderBy: { order: "asc" } } }
        });
    }
}
exports.ServiceRepository = ServiceRepository;
