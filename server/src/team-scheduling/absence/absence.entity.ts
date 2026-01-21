import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Employee } from '../employee/employee.entity';

export enum AbsenceType {
  PAID_LEAVE = 'PAID_LEAVE',
  SICK_LEAVE = 'SICK_LEAVE',
  TRAINING = 'TRAINING',
  UNPAID_LEAVE = 'UNPAID_LEAVE',
  RTT = 'RTT',
  OTHER = 'OTHER',
}

export enum AbsenceStatus {
  REQUESTED = 'REQUESTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

registerEnumType(AbsenceType, { name: 'AbsenceType' });
registerEnumType(AbsenceStatus, { name: 'AbsenceStatus' });

@ObjectType()
@Entity('absences')
export class Absence {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  employeeId: string;

  @Field(() => Employee)
  @ManyToOne(
    () => Employee,
    (employee: Employee): Absence[] => employee.absences,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'employeeId' })
  employee: Employee;

  @Field(() => AbsenceType)
  @Column({ type: 'varchar', default: AbsenceType.PAID_LEAVE })
  type: AbsenceType;

  @Field(() => AbsenceStatus)
  @Column({ type: 'varchar', default: AbsenceStatus.REQUESTED })
  status: AbsenceStatus;

  @Field()
  @Column({ type: 'date' })
  startDate: string;

  @Field()
  @Column({ type: 'date' })
  endDate: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  comment?: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
