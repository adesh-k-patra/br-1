import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Absence } from './absence.entity';
import { AbsenceService } from './absence.service';
import { RecordAbsenceInput, UpdateAbsenceStatusInput } from './absence.input';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';

@Resolver(() => Absence)
export class AbsenceResolver {
  constructor(private absenceService: AbsenceService) {}

  @Query(() => [Absence], { name: 'absences' })
  async getAbsences(): Promise<Absence[]> {
    return this.absenceService.findAll();
  }

  @Mutation(() => Absence)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async recordAbsence(
    @Args('input') input: RecordAbsenceInput,
  ): Promise<Absence> {
    return this.absenceService.record(input);
  }

  @Mutation(() => Absence)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async updateAbsenceStatus(
    @Args('input') input: UpdateAbsenceStatusInput,
  ): Promise<Absence> {
    return this.absenceService.updateStatus(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async deleteAbsence(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.absenceService.delete(id);
  }
}
