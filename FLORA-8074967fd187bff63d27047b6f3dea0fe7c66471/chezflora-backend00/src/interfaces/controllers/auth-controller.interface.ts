// src/interfaces/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { RegisterUserUseCase, LoginUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { UserRepository } from '../../domain/repositories/user-repository.interface';

export class AuthController {
    constructor(private readonly userRepository: UserRepository) { }

    async register(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const { firstName, lastName, email, password, phone } = req.body;

            // Execute use case
            const registerUserUseCase = new RegisterUserUseCase(this.userRepository);
            const result = await registerUserUseCase.execute({
                firstName,
                lastName,
                email,
                password,
                phone
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            // Validate request
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: errors.array()
                });
                return;
            }

            const { email, password } = req.body;

            // Execute use case
            const loginUserUseCase = new LoginUserUseCase(this.userRepository);
            const result = await loginUserUseCase.execute({
                email,
                password
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            res.status(500).json({
                success: false,
                message: `Server error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
}