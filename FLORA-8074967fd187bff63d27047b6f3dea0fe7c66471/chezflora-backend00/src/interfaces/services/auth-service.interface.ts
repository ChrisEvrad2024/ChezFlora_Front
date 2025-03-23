// src/interfaces/services/auth-service.interface.ts
import { UserEntity } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../../application/dtos/user/create-user.dto';
import { UpdateUserDto } from '../../application/dtos/user/update-user.dto';

export interface AuthResponse {
    user: Partial<UserEntity>;
    token: string;
}

export interface AuthServiceInterface {
    register(userData: CreateUserDto): Promise<AuthResponse>;
    login(email: string, password: string): Promise<AuthResponse>;
    verifyToken(token: string): Promise<UserEntity | null>;
    updateProfile(userId: string, userData: UpdateUserDto): Promise<Partial<UserEntity>>;
    requestPasswordReset(email: string): Promise<boolean>;
    resetPassword(token: string, newPassword: string): Promise<boolean>;
}