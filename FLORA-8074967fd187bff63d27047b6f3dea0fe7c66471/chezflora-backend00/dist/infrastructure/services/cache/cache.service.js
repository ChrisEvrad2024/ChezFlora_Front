"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("../config/logger");
class CacheService {
    constructor() {
        this.isConnected = false;
        this.client = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        this.client.on('connect', () => {
            this.isConnected = true;
            logger_1.logger.info('Connected to Redis');
        });
        this.client.on('error', (err) => {
            this.isConnected = false;
            logger_1.logger.error('Redis error:', err);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return null;
            try {
                const data = yield this.client.get(key);
                return data ? JSON.parse(data) : null;
            }
            catch (error) {
                logger_1.logger.error(`Error getting cache for key ${key}:`, error);
                return null;
            }
        });
    }
    set(key_1, data_1) {
        return __awaiter(this, arguments, void 0, function* (key, data, ttl = 3600) {
            if (!this.isConnected)
                return;
            try {
                yield this.client.set(key, JSON.stringify(data), 'EX', ttl);
            }
            catch (error) {
                logger_1.logger.error(`Error setting cache for key ${key}:`, error);
            }
        });
    }
    delete(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return;
            try {
                yield this.client.del(key);
            }
            catch (error) {
                logger_1.logger.error(`Error deleting cache for key ${key}:`, error);
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isConnected)
                return;
            try {
                yield this.client.flushall();
            }
            catch (error) {
                logger_1.logger.error('Error clearing cache:', error);
            }
        });
    }
}
exports.cacheService = new CacheService();
