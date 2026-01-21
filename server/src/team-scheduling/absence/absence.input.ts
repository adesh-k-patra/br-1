import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { AbsenceType, AbsenceStatus } from './absence.entity';

@InputType()
export class RecordAbsenceInput {
  @Field(() => ID)
  @IsUUID()
  employeeId: string;

  @Field(() => AbsenceType)
  @IsNotEmpty()
  type: AbsenceType;

  @Field()
  @IsNotEmpty()
  startDate: string;

  @Field()
  @IsNotEmpty()
  endDate: string;

  @Field({ nullable: true })
  @IsOptional()
  comment?: string;
}

@InputType()
export class RequestAbsenceInput {
  @Field(() => AbsenceType)
  @IsNotEmpty()
  type: AbsenceType;

  @Field()
  @IsNotEmpty()
  startDate: string;

  @Field()
  @IsNotEmpty()
  endDate: string;

  @Field({ nullable: true })
  @IsOptional()
  comment?: string;
}

@InputType()
export class UpdateAbsenceStatusInput {
  @Field(() => ID)
  @IsUUID()
  absenceId: string;

  @Field(() => AbsenceStatus)
  @IsNotEmpty()
  status: AbsenceStatus;
}
