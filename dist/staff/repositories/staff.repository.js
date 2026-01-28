"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffRepository = void 0;
class StaffRepository {
    constructor(prisma = prisma) {
        this.prisma = prisma;
    }
    create(data) {
        return this.prisma.staff.create({ data });
    }
    updateById(id, data) {
        return this.prisma.staff.update({
            where: { id },
            data,
        });
    }
    findById(id) {
        return this.prisma.staff.findUnique({
            where: { id },
        });
    }
    delete(id) {
        return this.prisma.staff.delete({
            where: { id }
        });
    }
    getPagnition(skip, take) {
        return this.prisma.staff.findMany({
            skip,
            take
        });
    }
    count() {
        return this.prisma.staff.count();
    }
}
exports.StaffRepository = StaffRepository;
