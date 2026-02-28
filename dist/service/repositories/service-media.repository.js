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
    async getAllMediaByService(serviceId) {
        return this.prisma.serviceMedia.findMany({
            where: {
                serviceId
            }
        });
    }
    async deleteById(id) {
        return this.prisma.serviceMedia.delete({
            where: {
                id
            }
        });
    }
    async deleteManyByIds(ids) {
        return this.prisma.serviceMedia.deleteMany({
            where: {
                id: {
                    in: ids
                }
            }
        });
    }
    async updateOrder(id, order) {
        return this.prisma.serviceMedia.update({
            where: {
                id: id
            },
            data: {
                order: order
            }
        });
    }
}
exports.ServiceMediaRepository = ServiceMediaRepository;
