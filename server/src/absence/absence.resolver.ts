import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Absence, AbsenceStatus } from './absence.entity';
import { AbsenceService } from './absence.service';
import { RecordAbsenceInput, UpdateAbsenceStatusInput } from './absence.input';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';

@Resolver(() => Absence)
export class AbsenceResolver {
  constructor(private absenceService: AbsenceService) {}

  @Query(() => [Absence], { name: 'absences' })
  async getAbsences(
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
    @Args('status', { nullable: true }) status?: AbsenceStatus,
  ): Promise<Absence[]> {
    return this.absenceService.getAbsences(
      employeeId,
      startDate,
      endDate,
      status,
    );
  }

  @Mutation(() => Absence)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async recordAbsence(
    @Args('input') input: RecordAbsenceInput,
  ): Promise<Absence> {
    return this.absenceService.recordAbsence(input);
  }

  @Mutation(() => Absence)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async updateAbsenceStatus(
    @Args('input') input: UpdateAbsenceStatusInput,
  ): Promise<Absence> {
    return this.absenceService.updateAbsenceStatus(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async deleteAbsence(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.absenceService.deleteAbsence(id);
  }
}
