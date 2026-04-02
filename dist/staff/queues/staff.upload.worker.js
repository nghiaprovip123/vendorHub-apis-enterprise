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
exports.avatarWorker = void 0;
// infrastructure/queues/avatar.worker.ts
const bullmq_1 = require("bullmq");
const bullmq_2 = require("@/lib/bullmq");
const cloudinary_orchestration_utils_1 = require("@/common/utils/cloudinary-orchestration.utils");
const prisma_1 = require("@/lib/prisma");
const logger_1 = require("@/lib/logger");
exports.avatarWorker = new bullmq_1.Worker("staff-avatar-upload", async (job) => {
    const { staffId, tempFilePath } = job.data;
    if (!staffId || !tempFilePath) {
        throw new Error("Invalid job data: missing staffId or tempFilePath");
    }
    const fs = await Promise.resolve().then(() => __importStar(require("fs")));
    const stat = fs.statSync(tempFilePath);
    if (stat.size > 5 * 1024 * 1024) {
        fs.unlinkSync(tempFilePath);
        throw new Error("File too large (max 5MB)");
    }
    logger_1.logger.info("Start avatar upload job", { jobId: job.id, staffId });
    const stream = fs.createReadStream(tempFilePath);
    const env = process.env.NODE_ENV === "production" ? "prod" : "dev";
    const upload = await cloudinary_orchestration_utils_1.CloudinaryRest.UploadImageToCloudinary(stream, {
        folder: `${env}/staffs`,
        public_id: `${staffId}/avatar`,
        resource_type: "image",
    });
    await prisma_1.prisma.staff.update({
        where: { id: staffId },
        data: {
            avatar_url: upload.secure_url,
            avatar_public_id: upload.public_id,
        },
    });
    fs.unlinkSync(tempFilePath);
    logger_1.logger.info("Avatar upload done", { jobId: job.id, staffId, url: upload.secure_url });
    return { url: upload.secure_url };
}, {
    connection: bullmq_2.bullmqConnection, // ← dùng shared connection
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
});
exports.avatarWorker.on("failed", (job, err) => {
    logger_1.logger.error("Avatar upload job failed", {
        jobId: job?.id,
        staffId: job?.data?.staffId,
        error: err.message,
    });
});
