import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { Employee } from '../employee/employee.entity';

@ObjectType()
@Entity('availabilities')
export class Availability {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  employeeId: string;

  @Field(() => Employee)
  @ManyToOne(
    () => Employee,
    (employee: Employee): Availability[] => employee.availabilities,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Field()
  @Column({ type: 'date' })
  date: string;

  @Field(() => Float)
  @Column({ type: 'float' })
  capacityHours: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  note: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
