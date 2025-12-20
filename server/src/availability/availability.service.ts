import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { EmployeeService } from '../employee/employee.service';
import { SetAvailabilityInput } from './availability.input';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
    private employeeService: EmployeeService,
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

  async setAvailability(input: SetAvailabilityInput): Promise<Availability> {
    await this.employeeService.findOne(input.employeeId);

    const existing = await this.availabilityRepository.findOne({
      where: {
        employeeId: input.employeeId,
        date: input.date,
      },
    });

    if (existing) {
      existing.capacityHours = input.capacityHours;
      existing.note = input.note;
      await this.availabilityRepository.save(existing);

      return (await this.availabilityRepository.findOne({
        where: { id: existing.id },
        relations: ['employee'],
      }))!;
    }

    const availability = await this.availabilityRepository.save(
      this.availabilityRepository.create({
        employeeId: input.employeeId,
        date: input.date,
        capacityHours: input.capacityHours,
        note: input.note,
      }),
    );

    return (await this.availabilityRepository.findOne({
      where: { id: availability.id },
      relations: ['employee'],
    }))!;
  }

  async deleteAvailability(id: string): Promise<boolean> {
    const result = await this.availabilityRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Availability not found');
    }
    return true;
  }
}
