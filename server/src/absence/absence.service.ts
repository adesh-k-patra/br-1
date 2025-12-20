import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { Absence, AbsenceStatus } from './absence.entity';
import { EmployeeService } from '../employee/employee.service';
import { RecordAbsenceInput, UpdateAbsenceStatusInput } from './absence.input';

@Injectable()
export class AbsenceService {
  constructor(
    @InjectRepository(Absence)
    private absenceRepository: Repository<Absence>,
    private employeeService: EmployeeService,
  ) {}

  async getAbsences(
    employeeId?: string,
    startDate?: Date,
    endDate?: Date,
    status?: AbsenceStatus,
  ): Promise<Absence[]> {
    const where: Record<string, any> = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.startDate = LessThanOrEqual(endDate);
      where.endDate = MoreThanOrEqual(startDate);
    } else if (startDate) {
      where.endDate = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.startDate = LessThanOrEqual(endDate);
    }

    return this.absenceRepository.find({
      where,
      relations: ['employee'],
      order: { startDate: 'DESC' },
    });
  }

  async recordAbsence(input: RecordAbsenceInput): Promise<Absence> {
    await this.employeeService.findOne(input.employeeId);

    if (new Date(input.startDate) > new Date(input.endDate)) {
      throw new BadRequestException(
        'Start date must be before or equal to end date',
      );
    }

    const overlapping = await this.findOverlappingAbsences(
      input.employeeId,
      input.startDate,
      input.endDate,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'An absence already exists for the overlapping dates',
      );
    }

    const absence = await this.absenceRepository.save(
      this.absenceRepository.create({
        ...input,
        status: AbsenceStatus.APPROVED,
      }),
    );

    return (await this.absenceRepository.findOne({
      where: { id: absence.id },
      relations: ['employee'],
    }))!;
  }

  async updateAbsenceStatus(input: UpdateAbsenceStatusInput): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({
      where: { id: input.absenceId },
    });

    if (!absence) {
      throw new NotFoundException('Absence not found');
    }
    if (absence.status !== AbsenceStatus.REQUESTED) {
      throw new BadRequestException('Only REQUESTED absences can be updated');
    }
    if (absence.status === input.status) {
      return absence;
    }

    absence.status = input.status;
    return this.absenceRepository.save(absence);
  }

  async deleteAbsence(id: string): Promise<boolean> {
    const result = await this.absenceRepository.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException('Absence not found');
    }
    return true;
  }

  private async findOverlappingAbsences(
    employeeId: string,
    startDate: string,
    endDate: string,
  ): Promise<Absence[]> {
    const query = this.absenceRepository
      .createQueryBuilder('absence')
      .where('absence.employeeId = :employeeId', { employeeId })
      .andWhere('absence.status != :rejected', {
        rejected: AbsenceStatus.REJECTED,
      })
      .andWhere(
        '((absence.startDate <= :endDate AND absence.endDate >= :startDate))',
        { startDate, endDate },
      );

    return query.getMany();
  }
}
