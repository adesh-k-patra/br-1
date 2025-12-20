import { Args, Query, Resolver } from '@nestjs/graphql';
import { ScheduleService } from './schedule.service';
import { TeamScheduleDay } from './schedule.types';

@Resolver()
export class ScheduleResolver {
  constructor(private scheduleService: ScheduleService) {}

  @Query(() => [TeamScheduleDay], { name: 'teamSchedule' })
  async getTeamSchedule(
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<TeamScheduleDay[]> {
    return this.scheduleService.getTeamSchedule(startDate, endDate);
  }
}
