import { InputType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';

export enum ComparisonOperator {
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN_OR_EQUAL = '<=',
  EQUAL = '=',
}

registerEnumType(ComparisonOperator, {
  name: 'ComparisonOperator',
});

@InputType()
export class LevelFilterInput {
  @Field(() => ComparisonOperator)
  @IsEnum(ComparisonOperator)
  op: ComparisonOperator;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(4)
  value: number;
}

@InputType()
export class MatrixFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  category?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  skillName?: string;

  @Field(() => LevelFilterInput, { nullable: true })
  @IsOptional()
  level?: LevelFilterInput;
}
