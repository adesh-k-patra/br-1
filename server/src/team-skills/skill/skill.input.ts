import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  Matches,
} from 'class-validator';

@InputType()
export class CreateSkillInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9 .+#-]+$/, {
    message: 'Skill name contains invalid characters',
  })
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  category: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType()
export class UpdateSkillInput extends PartialType(CreateSkillInput) {
  @Field(() => ID)
  @IsUUID()
  id: string;
}
