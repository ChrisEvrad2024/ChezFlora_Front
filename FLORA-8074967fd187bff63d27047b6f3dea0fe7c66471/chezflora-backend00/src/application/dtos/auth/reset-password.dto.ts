// src/application/dtos/auth/reset-password.dto.ts
export interface RequestPasswordResetDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    password: string;
}