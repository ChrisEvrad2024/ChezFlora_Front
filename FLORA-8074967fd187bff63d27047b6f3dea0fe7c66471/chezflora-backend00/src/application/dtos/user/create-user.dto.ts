// src/application/dtos/user/create-user.dto.ts
export interface CreateUserDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    role?: 'client' | 'admin' | 'super_admin';
    status?: 'active' | 'inactive' | 'banned';
}