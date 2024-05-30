import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'refreshTokens' })
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @ManyToOne(() => User)
    user: User;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;

    @CreateDateColumn({ select: false })
    createdAt: Date;
}
