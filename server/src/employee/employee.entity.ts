import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Absence } from 'src/absence/absence.entity';
import { Availability } from 'src/availability/availability.entity';

@ObjectType()
@Entity('employees')
export class Employee {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  role: string;

  @Field(() => Float)
  @Column({ type: 'float', default: 8 })
  defaultDailyCapacity: number;

  @Field(() => [Absence])
  @OneToMany(() => Absence, (absence) => absence.employee, { cascade: true })
  absences: Absence[];

  @Field(() => [Availability])
  @OneToMany(() => Availability, (availability) => availability.employee, {
    cascade: true,
  })
  availabilities: Availability[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
