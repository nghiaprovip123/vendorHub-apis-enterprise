"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateServiceService = void 0;
const prisma_1 = require("@/lib/prisma");
const service_error_1 = require("@/common/utils/error/service.error");
const service_repository_1 = require("@/service/repositories/service.repository");
const redis_1 = __importDefault(require("@/lib/redis"));
const service_upload_queue_1 = require("@/service/queues/service.upload.queue");
const fsSync = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const os = __importStar(require("os"));
const CreateServiceService = async (input) => {
    const { categoryId, name, description, currency = "VND", duration, price, medias = [], } = input;
    // 1. Create service
    const createdService = await prisma_1.prisma.$transaction(async (tx) => {
        const serviceRepo = new service_repository_1.ServiceRepository(tx);
        const created = await serviceRepo.createService(categoryId, name, description, currency, duration, price);
        if (!created)
            throw new Error(service_error_1.ServiceError.SERVICE_PRISMA_ERROR);
        return created;
    });
    // 2. Write to temp files + enqueue paths (fast stream pipe)
    console.log('Processing medias:', medias.map(m => ({ type: m.type, file: !!m.file }))); // DEBUG
    const tempMedias = await Promise.all(medias.filter(media => media.file).map(async (media, index) => {
        const file = await media.file;
        const fileInfo = await file;
        const stream = fileInfo.createReadStream();
        // Unique temp filepath
        const tempDir = os.tmpdir();
        const filename = `service-media-${crypto.randomUUID()}-${Date.now()}-${index}`;
        const tempPath = path.join(tempDir, filename);
        // Pipe stream to temp file (non-blocking)
        await new Promise((resolve, reject) => {
            const writeStream = fsSync.createWriteStream(tempPath);
            stream.pipe(writeStream);
            writeStream.on('finish', () => resolve());
            writeStream.on('error', reject);
            stream.on('error', reject);
        });
        return {
            tempPath,
            type: media.type,
            order: media.order ?? index,
        };
    }));
    await service_upload_queue_1.serviceImageQueue.add('service-media-upload', {
        serviceId: createdService.id,
        medias: tempMedias,
    });
    // 3. Invalidate cache — không block nếu fail
    redis_1.default.del("service:list:page:1").catch(err => console.error('Cache invalidation failed:', err));
    // 4. Return ngay — medias sẽ có sau khi worker xử lý xong
    return { service: createdService };
};
exports.CreateServiceService = CreateServiceService;
