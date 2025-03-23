// src/application/services/auth/auth.service.ts
import { UserRepositoryInterface } from '../../../interfaces/repositories/user-repository.interface';
import { AuthServiceInterface, AuthResponse } from '../../../interfaces/services/auth-service.interface';
import { UserEntity } from '../../../domain/entities/user.entity';
import { CreateUserDto } from '../../dtos/user/create-user.dto';
import { UpdateUserDto } from '../../dtos/user/update-user.dto';
import { AppError } from '../../../infrastructure/http/middlewares/error.middleware';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

export class AuthService implements AuthServiceInterface {
    constructor(private userRepository: UserRepositoryInterface) { }

    async register(userData: CreateUserDto): Promise<AuthResponse> {
        // Vérifier si l'email existe déjà
        const existingUser = await this.userRepository.findByEmail(userData.email);
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        // Créer l'utilisateur
        const user = await this.userRepository.create({
            ...userData,
            role: 'client',
            status: 'active',
        });

        // Générer le token
        const token = this.generateToken(user);

        // Retourner les données sans le mot de passe
        const { password, ...userWithoutPassword } = user as any;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        // Trouver l'utilisateur par email
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            throw new AppError('Invalid email or password', 401);
        }

        // Vérifier si l'utilisateur est actif
        if (user.status !== 'active') {
            throw new AppError('Account is not active', 401);
        }

        // Vérifier le mot de passe avec bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid email or password', 401);
        }

        // Mettre à jour la date de dernière connexion
        await this.userRepository.update(user.id, { lastLogin: new Date() });

        // Générer le token
        const token = this.generateToken(user);

        // Retourner les données sans le mot de passe
        const { password: pwd, ...userWithoutPassword } = user as any;

        return {
            user: userWithoutPassword,
            token,
        };
    }

    async verifyToken(token: string): Promise<UserEntity | null> {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { id: string };
            return this.userRepository.findById(decoded.id);
        } catch (error) {
            return null;
        }
    }

    async updateProfile(userId: string, userData: UpdateUserDto): Promise<Partial<UserEntity>> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Vérifier si l'email est déjà utilisé
        if (userData.email && userData.email !== user.email) {
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                throw new AppError('Email already in use', 400);
            }
        }

        // Mettre à jour l'utilisateur
        const updatedUser = await this.userRepository.update(userId, userData);

        if (!updatedUser) {
            throw new AppError('User update failed', 500);
        }

        // Retourner les données sans le mot de passe
        const { password, ...userWithoutPassword } = updatedUser as any;
        return userWithoutPassword;
    }

    async requestPasswordReset(email: string): Promise<boolean> {
        const user = await this.userRepository.findByEmail(email);

        if (!user) {
            // Ne pas révéler que l'email n'existe pas
            return true;
        }

        // Générer un token unique
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Définir l'expiration à 1 heure
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        // Enregistrer le token dans la base de données
        await this.userRepository.update(user.id, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: expiresAt,
        });

        // En production, vous enverriez un email avec le lien de réinitialisation
        // contenant le token resetToken (non haché)
        console.log(`Reset token for ${email}: ${resetToken}`);

        return true;
    }

    async resetPassword(token: string, newPassword: string): Promise<boolean> {
        const user = await this.userRepository.findByResetToken(token);

        if (!user) {
            throw new AppError('Invalid or expired token', 400);
        }

        // Mettre à jour le mot de passe et supprimer le token
        await this.userRepository.update(user.id, {
            password: newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });

        return true;
    }

    private generateToken(user: UserEntity): string {
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );
    }
}