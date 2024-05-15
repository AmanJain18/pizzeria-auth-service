import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Tenant } from './Tenant';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 30 })
    firstName: string;

    @Column('varchar', { length: 30 })
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false })
    password: string;

    @Column('varchar', { length: 20 })
    role: string;

    @ManyToOne(() => Tenant)
    tenant: Tenant;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;

    @CreateDateColumn({ select: false })
    createdAt: Date;
}
