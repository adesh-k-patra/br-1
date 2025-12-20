import { InputType, Field, ID, Float } from '@nestjs/graphql';
import { IsOptional, IsUUID, Min, IsNotEmpty } from 'class-validator';

@InputType()
export class SetAvailabilityInput {
  @Field(() => ID)
  @IsUUID()
  employeeId: string;

  @Field()
  @IsNotEmpty()
  date: string;

  @Field(() => Float)
  @Min(0)
  capacityHours: number;

  @Field({ nullable: true })
  @IsOptional()
  note: string;
}
