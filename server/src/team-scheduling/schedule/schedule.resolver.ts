import { Args, GraphQLISODateTime, Query, Resolver } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { TeamScheduleDay } from './schedule.types';

@Resolver()
export class ScheduleResolver {
  constructor(private scheduleService: ScheduleService) {}

  @Query(() => [TeamScheduleDay], { name: 'teamSchedule' })
  async getTeamSchedule(
    @Args('startDate', { type: () => GraphQLISODateTime }) startDate: Date,
    @Args('endDate', { type: () => GraphQLISODateTime }) endDate: Date,
  ): Promise<TeamScheduleDay[]> {
    return this.scheduleService.getTeamSchedule(startDate, endDate);
  }
}
