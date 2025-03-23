// src/infrastructure/database/models/user.model.ts
import { Table, Column, Model, DataType, BeforeCreate, BeforeUpdate } from 'sequelize-typescript';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Table({
    tableName: 'users',
    timestamps: true,
    underscored: true,
})
export default class User extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
        indexes:[
            // Définissez ici uniquement les index dont vous avez vraiment besoin
            {
                unique: true,
                fields: ['email'],
                name: 'users_email_unique'
            },]
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        field: 'first_name',
        allowNull: false,
    })
    firstName!: string;

    @Column({
        type: DataType.STRING,
        field: 'last_name',
        allowNull: false,
    })
    lastName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    phone?: string;

    @Column({
        type: DataType.ENUM('client', 'admin', 'super_admin'),
        defaultValue: 'client',
    })
    role!: string;

    @Column({
        type: DataType.ENUM('active', 'inactive', 'banned'),
        defaultValue: 'active',
    })
    status!: string;

    @Column({
        type: DataType.DATE,
        field: 'last_login',
        allowNull: true,
    })
    lastLogin?: Date;

    @Column({
        type: DataType.STRING,
        field: 'reset_password_token',
        allowNull: true,
    })
    resetPasswordToken?: string;

    @Column({
        type: DataType.DATE,
        field: 'reset_password_expires',
        allowNull: true,
    })
    resetPasswordExpires?: Date;

    @BeforeCreate
    @BeforeUpdate
    static async hashPassword(instance: User) {
        if (instance.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            instance.password = await bcrypt.hash(instance.password, salt);
        }
    }

    async comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password);
    }
}