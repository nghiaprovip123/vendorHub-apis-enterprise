"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendOTPSchema = void 0;
const zod_1 = require("zod");
exports.SendOTPSchema = zod_1.z.object({
    phone: zod_1.z.string(),
    email: zod_1.z.email(),
});
