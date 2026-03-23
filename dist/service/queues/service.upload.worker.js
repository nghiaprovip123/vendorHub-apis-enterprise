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
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const bullmq_2 = require("../../lib/bullmq");
const cloudinary_orchestration_utils_1 = require("../../common/utils/cloudinary-orchestration.utils");
const prisma_1 = require("../../lib/prisma");
const logger_1 = require("../../lib/logger");
const fs = __importStar(require("fs"));
new bullmq_1.Worker("service-media-upload", async (job) => {
    const { serviceId, medias } = job.data;
    const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const uploadResults = await Promise.allSettled(medias.map(async (media) => {
        try {
            // Verify temp file exists
            if (!fs.existsSync(media.tempPath)) {
                throw new Error(`Temp file missing: ${media.tempPath}`);
            }
            // Create read stream from temp file
            const tempStream = fs.createReadStream(media.tempPath);
            const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(tempStream, {
                folder: `${env}/services/${serviceId}`,
                public_id: `image_${media.order}`,
                resource_type: "image",
            });
            // Cleanup temp file
            await fs.promises.unlink(media.tempPath).catch(err => logger_1.logger.warn(`Cleanup failed ${media.tempPath}:`, err));
            return {
                serviceId,
                url: upload.secure_url,
                public_id: upload.public_id,
                type: media.type,
                order: media.order,
            };
        }
        catch (err) {
            // Cleanup on error
            await fs.promises.unlink(media.tempPath).catch(() => { });
            throw err;
        }
    }));
    const successful = uploadResults
        .filter((r) => r.status === "fulfilled")
        .map((r) => r.value);
    const failed = uploadResults.filter((r) => r.status === "rejected");
    if (failed.length > 0) {
        logger_1.logger.warn(`[service-media-upload] ${failed.length} upload(s) failed for service ${serviceId}:`, failed.map(f => f.reason));
    }
    if (successful.length > 0) {
        await prisma_1.prisma.serviceMedia.createMany({ data: successful });
    }
}, {
    connection: bullmq_2.bullmqConnection,
    concurrency: 3, // Limit parallel Cloudinary uploads
});
