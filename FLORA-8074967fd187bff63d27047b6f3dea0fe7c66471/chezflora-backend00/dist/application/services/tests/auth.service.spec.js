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
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = require("../auth.service");
// Mock du UserRepository
const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
};
describe('AuthService', () => {
    let authService;
    beforeEach(() => {
        jest.clearAllMocks();
        authService = new auth_service_1.AuthService(mockUserRepository);
    });
    describe('register', () => {
        it('should throw error if email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userData = {
                email: 'existing@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };
            mockUserRepository.findByEmail.mockResolvedValue({
                id: '1',
                email: 'existing@example.com',
                password: 'hashedpassword',
                firstName: 'John',
                lastName: 'Doe',
                role: 'client',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            // Act & Assert
            yield expect(authService.register(userData)).rejects.toThrow('Email already in use');
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
        }));
        it('should register a new user successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const userData = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };
            const createdUser = Object.assign(Object.assign({ id: '1' }, userData), { role: 'client', status: 'active', createdAt: new Date(), updatedAt: new Date(), get: jest.fn().mockReturnValue({
                    id: '1',
                    email: 'new@example.com',
                    password: 'hashedpassword',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'client',
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }) });
            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(createdUser);
            // Act
            const result = yield authService.register(userData);
            // Assert
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
            expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
        }));
    });
    // Plus de tests pour login, verifyToken, etc.
});
