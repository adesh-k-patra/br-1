import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Availability } from './availability.entity';
import { AvailabilityService } from './availability.service';
import { SetAvailabilityInput } from './availability.input';
import { Roles } from '../auth/role.decorator';
import { RoleGuard } from '../auth/role.guard';

@Resolver(() => Availability)
export class AvailabilityResolver {
  constructor(private availabilityService: AvailabilityService) {}

  @Query(() => [Availability], { name: 'availabilities' })
  async getAvailabilities(
    @Args('employeeId', { type: () => ID, nullable: true }) employeeId?: string,
    @Args('startDate', { type: () => GraphQLISODateTime, nullable: true })
    startDate?: Date,
    @Args('endDate', { type: () => GraphQLISODateTime, nullable: true })
    endDate?: Date,
  ): Promise<Availability[]> {
    return this.availabilityService.getAvailabilities(
      employeeId,
      startDate,
      endDate,
    );
  }

  @Mutation(() => Availability)
  @UseGuards(RoleGuard)
  @Roles('manager')
  async setAvailability(
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
