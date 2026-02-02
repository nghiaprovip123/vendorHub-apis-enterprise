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
}
exports.ServiceRepository = ServiceRepository;
