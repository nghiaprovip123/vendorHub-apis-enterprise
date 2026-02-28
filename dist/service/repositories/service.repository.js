"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
const client_1 = require("@prisma/client");
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
            take,
            where: {
                isDeleted: false,
                category: {
                    level: client_1.CategoryLevel.LEVEL_1
                }
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                medias: {
                    select: {
                        id: true,
                        public_id: true,
                        order: true,
                        url: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }
    async getAllService() {
        return this.prisma.service.findMany({
            where: {
                category: {
                    level: client_1.CategoryLevel.LEVEL_1
                },
                isDeleted: false
            }
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
    async softDeleteById(id) {
        return this.prisma.service.update({
            where: { id },
            data: {
                isDeleted: true,
                isVisible: false
            }
        });
    }
    async findMediasByServiceId(serviceId) {
        return this.prisma.serviceMedia.findMany({
            where: { serviceId },
            select: {
                id: true,
                public_id: true
            }
        });
    }
    async deleteMediasByServiceId(serviceId) {
        return this.prisma.serviceMedia.deleteMany({
            where: { serviceId }
        });
    }
    async deleteServiceById(serviceId) {
        return this.prisma.service.delete({
            where: { id: serviceId }
        });
    }
}
exports.ServiceRepository = ServiceRepository;
