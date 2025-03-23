// src/interfaces/repositories/user-repository.interface.ts
import { UserEntity } from '../../domain/entities/user.entity';

export interface UserRepositoryInterface {
    findById(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    findAll(options?: any): Promise<UserEntity[]>;
    create(user: Partial<UserEntity>): Promise<UserEntity>;
    update(id: string, user: Partial<UserEntity>): Promise<UserEntity | null>;
    delete(id: string): Promise<boolean>;
    findByResetToken(token: string): Promise<UserEntity | null>;
}