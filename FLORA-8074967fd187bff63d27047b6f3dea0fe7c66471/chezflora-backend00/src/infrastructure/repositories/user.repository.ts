// src/infrastructure/repositories/user.repository.ts
import { UserRepositoryInterface } from '../../interfaces/repositories/user-repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import User from '../database/models/user.model'; // Assurez-vous d'importer correctement le modèle
import { Op } from 'sequelize';

export class UserRepository implements UserRepositoryInterface {
    async findById(id: string): Promise<UserEntity | null> {
        const user = await User.findByPk(id);
        return user ? user.toJSON() as UserEntity : null;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        const user = await User.findOne({ where: { email } });
        return user ? user.toJSON() as UserEntity : null;
    }

    async findAll(options?: any): Promise<UserEntity[]> {
        const users = await User.findAll(options);
        return users.map(user => user.toJSON() as UserEntity);
    }

    async create(userData: Partial<UserEntity>): Promise<UserEntity> {
        const user = await User.create(userData);
        return user.toJSON() as UserEntity;
    }

    async update(id: string, userData: Partial<UserEntity>): Promise<UserEntity | null> {
        const user = await User.findByPk(id);

        if (!user) {
            return null;
        }

        await user.update(userData);
        return user.toJSON() as UserEntity;
    }

    async delete(id: string): Promise<boolean> {
        const result = await User.destroy({ where: { id } });
        return result > 0;
    }

    async findByResetToken(token: string): Promise<UserEntity | null> {
        // Si vous utilisez Sequelize
        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    [Op.gt]: new Date() // Expiration supérieure à maintenant (non expirée)
                }
            }
        });

        return user ? user.toJSON() as UserEntity : null;
    }
}