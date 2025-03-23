// src/application/dtos/user/user-response.dto.ts
export interface UserResponseDto {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    role: 'client' | 'admin' | 'super_admin';
    status: 'active' | 'inactive' | 'banned';
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}