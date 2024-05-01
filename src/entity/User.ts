import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

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

    @Column()
    password: string;

    @Column('varchar', { length: 20 })
    role: string;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;

    @CreateDateColumn({ select: false })
    createdAt: Date;
}
