import { ObjectType, Field, Float } from '@nestjs/graphql';
import { Employee } from '../employee/employee.entity';
import { AbsenceType } from '../absence/absence.entity';

@ObjectType()
export class EmployeeSchedule {
  @Field(() => Employee)
  employee: Employee;

  @Field()
  isAbsent: boolean;

  @Field(() => AbsenceType, { nullable: true })
  absenceType?: AbsenceType;

  @Field(() => Float)
  capacityHours: number;

  @Field(() => Float)
  effectiveCapacityHours: number;
}

@ObjectType()
export class TeamScheduleDay {
  @Field()
  date: string;

  @Field(() => [EmployeeSchedule])
  employees: EmployeeSchedule[];
}
