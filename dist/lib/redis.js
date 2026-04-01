"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = exports.disconnectRedis = exports.connectRedis = void 0;
const redis_1 = require("redis");
const logger_1 = require("./logger");
const redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_CONNECTION,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                logger_1.logger.error('redis_reconnect_failed');
                return new Error('Redis reconnect failed');
            }
            return Math.min(retries * 100, 3000); // backoff
        },
    },
});
redisClient.on('connect', () => {
    logger_1.logger.info('redis_connecting');
});
redisClient.on('ready', () => {
    logger_1.logger.info('redis_ready');
});
redisClient.on('error', (err) => {
    logger_1.logger.error('redis_error', {
        message: err.message,
    });
});
redisClient.on('end', () => {
    logger_1.logger.warn('redis_connection_closed');
});
const connectRedis = async () => {
    if (!redisClient.isOpen) {
        await redisClient.connect();
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    if (redisClient.isOpen) {
        await redisClient.quit();
    }
};
exports.disconnectRedis = disconnectRedis;
exports.redis = redisClient;
exports.default = redisClient;
