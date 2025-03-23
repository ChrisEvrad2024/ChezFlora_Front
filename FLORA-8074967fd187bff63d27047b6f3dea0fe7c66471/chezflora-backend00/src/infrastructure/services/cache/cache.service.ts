import Redis from 'ioredis';
import { logger } from '../config/logger';

class CacheService {
    private client: Redis;
    private isConnected: boolean = false;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });

        this.client.on('connect', () => {
            this.isConnected = true;
            logger.info('Connected to Redis');
        });

        this.client.on('error', (err) => {
            this.isConnected = false;
            logger.error('Redis error:', err);
        });
    }

    async get(key: string): Promise<any> {
        if (!this.isConnected) return null;

        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            logger.error(`Error getting cache for key ${key}:`, error);
            return null;
        }
    }

    async set(key: string, data: any, ttl: number = 3600): Promise<void> {
        if (!this.isConnected) return;

        try {
            await this.client.set(key, JSON.stringify(data), 'EX', ttl);
        } catch (error) {
            logger.error(`Error setting cache for key ${key}:`, error);
        }
    }

    async delete(key: string): Promise<void> {
        if (!this.isConnected) return;

        try {
            await this.client.del(key);
        } catch (error) {
            logger.error(`Error deleting cache for key ${key}:`, error);
        }
    }

    async clear(): Promise<void> {
        if (!this.isConnected) return;

        try {
            await this.client.flushall();
        } catch (error) {
            logger.error('Error clearing cache:', error);
        }
    }
}

export const cacheService = new CacheService();