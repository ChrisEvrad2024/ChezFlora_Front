// src/infrastructure/database/models/newsletter-subscription.model.ts
import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import User from './user.model';

@Table({
    tableName: 'newsletter_subscriptions',
    timestamps: true,
    underscored: true,
})
export default class NewsletterSubscription extends Model {
    @Column({
        type: DataType.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    })
    email!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        field: 'user_id',
        allowNull: true,
    })
    userId?: string;

    @BelongsTo(() => User)
    user?: User;

    @Column({
        type: DataType.BOOLEAN,
        defaultValue: true,
    })
    active!: boolean;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    token?: string;

    @Column({
        type: DataType.DATE,
        field: 'confirmed_at',
        allowNull: true,
    })
    confirmedAt?: Date;
}