// src/application/dtos/user/update-user.dto.ts
export interface UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    status?: 'active' | 'inactive' | 'banned';
}