import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findAll(): Promise<Absence[]> {
    return this.absenceRepository.find({
      relations: ['employee'],
      order: { startDate: 'DESC' },
    });
  }

  async record(input: RecordAbsenceInput): Promise<Absence> {
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

    const absence = this.absenceRepository.create({
      ...input,
      status: AbsenceStatus.APPROVED,
    });
    return this.absenceRepository.save(absence);
  }

  async updateStatus(input: UpdateAbsenceStatusInput): Promise<Absence> {
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

  async delete(id: string): Promise<boolean> {
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
