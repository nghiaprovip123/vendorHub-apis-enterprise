"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiLimiter = void 0;
const rateLimit = require('express-rate-limit');
exports.apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
});
