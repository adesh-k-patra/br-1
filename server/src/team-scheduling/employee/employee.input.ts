import { InputType, Field, Float, PartialType, ID } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsUUID, Min } from 'class-validator';

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

  @Field(() => Float, { defaultValue: 8 })
  @Min(0)
  defaultDailyCapacityHours: number;
}

@InputType()
export class UpdateEmployeeInput extends PartialType(CreateEmployeeInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
