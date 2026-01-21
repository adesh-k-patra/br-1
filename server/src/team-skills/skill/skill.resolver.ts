import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Skill } from './skill.entity';
import { SkillService } from './skill.service';
import { CreateSkillInput, UpdateSkillInput } from './skill.input';
import { UseGuards } from '@nestjs/common';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/role.decorator';

@Resolver(() => Skill)
export class SkillResolver {
  constructor(private readonly skillService: SkillService) {}

  @Query(() => [Skill], { name: 'skills' })
  async getSkills(): Promise<Skill[]> {
    return this.skillService.findAll();
  }

  @Query(() => Skill, { name: 'skill' })
  async getSkill(@Args('id', { type: () => ID }) id: string): Promise<Skill> {
    return this.skillService.findOne(id);
  }

  @Mutation(() => Skill)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async createSkill(@Args('input') input: CreateSkillInput): Promise<Skill> {
    return this.skillService.create(input);
  }

  @Mutation(() => Skill)
  @UseGuards(RoleGuard)
  @Roles('manager')
  updateSkill(@Args('input') input: UpdateSkillInput): Promise<Skill> {
    return this.skillService.update(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  removeSkill(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    return this.skillService.remove(id);
  }
}
