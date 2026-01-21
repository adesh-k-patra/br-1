import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID, Min, Max } from 'class-validator';

@InputType()
export class CreateEmployeeSkillInput {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  employeeId: string;

  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  skillId: string;

  @Field(() => Int)
  @IsNotEmpty()
  @Min(1)
  @Max(4)
  level: number;
}

@InputType()
export class UpdateEmployeeSkillInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => Int)
  @IsNotEmpty()
  @Min(1)
  @Max(4)
  level: number;
}
