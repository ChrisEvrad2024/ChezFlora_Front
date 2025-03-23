import { AuthService } from '../auth.service';
import { UserRepositoryInterface } from '../../../interfaces/repositories/user-repository.interface';

// Mock du UserRepository
const mockUserRepository: jest.Mocked<UserRepositoryInterface> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findAll: jest.fn(),
};

describe('AuthService', () => {
    let authService: AuthService;

    beforeEach(() => {
        jest.clearAllMocks();
        authService = new AuthService(mockUserRepository);
    });

    describe('register', () => {
        it('should throw error if email already exists', async () => {
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
            await expect(authService.register(userData)).rejects.toThrow('Email already in use');
            expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
        });

        it('should register a new user successfully', async () => {
            // Arrange
            const userData = {
                email: 'new@example.com',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
            };

            const createdUser = {
                id: '1',
                ...userData,
                role: 'client',
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
                get: jest.fn().mockReturnValue({
                    id: '1',
                    email: 'new@example.com',
                    password: 'hashedpassword',
                    firstName: 'John',
                    lastName: 'Doe',
                    role: 'client',
                    status: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }),
            };

            mockUserRepository.findByEmail.mockResolvedValue(null);
            mockUserRepository.create.mockResolvedValue(createdUser);

            // Act
            const result = await authService.register(userData);

            // Assert
            expect(result).toHaveProperty('token');
            expect(result).toHaveProperty('user');
            expect(result.user).not.toHaveProperty('password');
            expect(mockUserRepository.create).toHaveBeenCalledWith(userData);
        });
    });

    // Plus de tests pour login, verifyToken, etc.
});