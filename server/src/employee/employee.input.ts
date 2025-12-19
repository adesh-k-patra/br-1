import { InputType, Field, Float, PartialType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, Min } from 'class-validator';

@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @Field()
  @IsEmail({}, { message: 'Valid email is required' })
  email: string;

  @Field()
  @IsNotEmpty({ message: 'Role is required' })
  role: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @Min(0)
  defaultDailyCapacity?: number;
}

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {}
