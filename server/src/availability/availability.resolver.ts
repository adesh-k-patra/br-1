import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Availability } from './availability.entity';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityInput } from './availability.input';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';

@Resolver(() => Availability)
export class AvailabilityResolver {
  constructor(private availabilityService: AvailabilityService) {}

  @Query(() => [Availability])
  async availabilities(
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('startDate', { nullable: true }) startDate?: string,
    @Args('endDate', { nullable: true }) endDate?: string,
  ): Promise<Availability[]> {
    return this.availabilityService.availabilities(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Mutation(() => Availability)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async createAvailability(
    @Args('input') input: SetAvailabilityInput,
  ): Promise<Availability> {
    return this.availabilityService.setAvailability(input);
  }

  @Mutation(() => Boolean)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async deleteAvailability(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.availabilityService.deleteAvailability(id);
  }
}
