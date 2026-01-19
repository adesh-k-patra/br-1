import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Availability } from './availability.entity';
import { EmployeeService } from '../employee/employee.service';
import { SetAvailabilityInput } from './availability.input';
import { AbsenceService } from 'src/absence/absence.service';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    private absenceService: AbsenceService,
    private employeeService: EmployeeService,
    private dataSource: DataSource,
  ) {}

  async getAvailabilities(
    employeeId?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Availability[]> {
    const where: Record<string, any> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.date = LessThanOrEqual(endDate);
    }

    return this.availabilityRepository.find({
      where,
      relations: ['employee'],
      order: { date: 'DESC' },
    });
  }

  async getAvailabilitiesByEmployeeIds(
    employeeIds: string[],
  ): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { employeeId: In(employeeIds) },
      order: { date: 'DESC' },
    });
  }

  async setAvailability(input: SetAvailabilityInput): Promise<Availability> {
    return this.dataSource.transaction(async (manager) => {
      const availabilityRepo = manager.getRepository(Availability);

      await this.employeeService.findOne(input.employeeId);

      const hasAbsence = await this.absenceService.hasApprovedAbsenceOnDate(
        input.employeeId,
        input.date,
      );

      if (hasAbsence) {
        throw new BadRequestException(
          `Conflict with absence: Availability set on a fully absent day (${input.date})`,
        );
      }

      const existing = await availabilityRepo.findOne({
        where: {
          employeeId: input.employeeId,
          date: input.date,
        },
      });

      if (existing) {
        existing.capacityHours = input.capacityHours;
        existing.note = input.note;
        await availabilityRepo.save(existing);
        return (await availabilityRepo.findOne({
          where: { id: existing.id },
          relations: ['employee'],
        }))!;
      }

      const availability = await availabilityRepo.save(
        availabilityRepo.create({
          employeeId: input.employeeId,
          date: input.date,
          capacityHours: input.capacityHours,
          note: input.note,
        }),
      );

      return (await availabilityRepo.findOne({
        where: { id: availability.id },
        relations: ['employee'],
      }))!;
    });
  }

  async deleteAvailability(id: string): Promise<boolean> {
    const result = await this.availabilityRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Availability not found');
    }
    return true;
  }
}
