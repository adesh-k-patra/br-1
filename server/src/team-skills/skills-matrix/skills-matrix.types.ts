import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class SkillsMatrix {
  @Field(() => [SkillColumn])
  skills: SkillColumn[];

  @Field(() => [EmployeeRow])
  employees: EmployeeRow[];

  @Field(() => [CriticalSkill])
  criticalSkills: CriticalSkill[];
}

@ObjectType()
export class SkillColumn {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  category: string;

  @Field()
  archived: boolean;
}

@ObjectType()
export class EmployeeSkillCell {
  @Field(() => ID)
  skillId: string;

  @Field(() => Int, { nullable: true })
  level?: number;
}

@ObjectType()
export class EmployeeRow {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [EmployeeSkillCell])
  skills: EmployeeSkillCell[];
}

@ObjectType()
export class CriticalSkill {
  @Field(() => ID)
  skillId: string;

  @Field()
  skillName: string;

  @Field(() => Int)
  holderCount: number;

  @Field(() => Int)
  expertCount: number;

  @Field()
  isCritical: boolean;
}
