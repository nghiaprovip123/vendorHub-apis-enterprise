import { createClient } from 'redis';
import { logger } from './logger';

const redisClient = createClient({
  url: process.env.REDIS_CONNECTION,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        logger.error('redis_reconnect_failed');
        return new Error('Redis reconnect failed');
      }
      return Math.min(retries * 100, 3000); // backoff
    },
  },
});

redisClient.on('connect', () => {
  logger.info('redis_connecting');
});

redisClient.on('ready', () => {
  logger.info('redis_ready');
});

redisClient.on('error', (err) => {
  logger.error('redis_error', {
    message: err.message,
  });
});

redisClient.on('end', () => {
  logger.warn('redis_connection_closed');
});

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export const disconnectRedis = async () => {
  if (redisClient.isOpen) {
    await redisClient.quit();
  }
};

export default redisClient;