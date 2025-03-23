// src/domain/entities/user.entity.ts
export interface UserEntity {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string | null;
    role: 'client' | 'admin' | 'super_admin';
    status: 'active' | 'inactive' | 'banned';
    lastLogin?: Date | null;
    resetPasswordToken?: string | null;
    resetPasswordExpires?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}