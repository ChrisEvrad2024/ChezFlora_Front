// src/infrastructure/http/controllers/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthServiceInterface } from '../../../interfaces/services/auth-service.interface';
import { CreateUserDto } from '../../../application/dtos/user/create-user.dto';
import { LoginDto } from '../../../application/dtos/auth/login.dto';
import { UpdateUserDto } from '../../../application/dtos/user/update-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from '../../../application/dtos/auth/reset-password.dto';
import { AppError } from '../middlewares/error.middleware';

export class AuthController {
    constructor(private authService: AuthServiceInterface) { }

    register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userData: CreateUserDto = req.body;
            const authData = await this.authService.register(userData);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: authData
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email, password }: LoginDto = req.body;
            const authData = await this.authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: authData
            });
        } catch (error) {
            next(error);
        }
    };

    updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                throw new AppError('Authentication required', 401);
            }

            const userData: UpdateUserDto = req.body;
            const updatedUser = await this.authService.updateProfile(userId, userData);

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        } catch (error) {
            next(error);
        }
    };

    requestPasswordReset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { email }: RequestPasswordResetDto = req.body;
            await this.authService.requestPasswordReset(email);

            res.status(200).json({
                success: true,
                message: 'If your email is registered, you will receive a password reset link'
            });
        } catch (error) {
            next(error);
        }
    };

    resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { token, password }: ResetPasswordDto = req.body;
            await this.authService.resetPassword(token, password);

            res.status(200).json({
                success: true,
                message: 'Password has been reset successfully'
            });
        } catch (error) {
            next(error);
        }
    };
}