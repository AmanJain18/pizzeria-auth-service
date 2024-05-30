import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'tenants' })
export class Tenant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    name: string;

    @Column('varchar', { length: 255 })
    address: string;

    @UpdateDateColumn({ select: false })
    updatedAt: Date;

    @CreateDateColumn({ select: false })
    createdAt: Date;
}
