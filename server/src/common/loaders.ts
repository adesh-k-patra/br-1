import DataLoader from 'dataloader';
import { AbsenceService } from '../absence/absence.service';
import { AvailabilityService } from '../availability/availability.service';
import { Absence } from '../absence/absence.entity';
import { Availability } from '../availability/availability.entity';

export interface IGraphQLContext {
  req: unknown;
  loaders: {
    absences: DataLoader<string, Absence[]>;
    availabilities: DataLoader<string, Availability[]>;
  };
}

export const createLoaders = (
  absenceService: AbsenceService,
  availabilityService: AvailabilityService,
) => ({
  absences: new DataLoader<string, Absence[]>(
    async (employeeIds: readonly string[]): Promise<Absence[][]> => {
      const absences: Absence[] = await absenceService.getAbsencesByEmployeeIds(
        employeeIds as string[],
      );

      const map = new Map<string, Absence[]>();
      employeeIds.forEach((id) => map.set(id, []));

      absences.forEach((absence) => {
        map.get(absence.employeeId)?.push(absence);
      });

      return employeeIds.map((id) => map.get(id)!);
    },
  ),

  availabilities: new DataLoader<string, Availability[]>(
    async (employeeIds: readonly string[]): Promise<Availability[][]> => {
      const availabilities: Availability[] =
        await availabilityService.getAvailabilitiesByEmployeeIds(
          employeeIds as string[],
        );

      const map = new Map<string, Availability[]>();
      employeeIds.forEach((id) => map.set(id, []));

      availabilities.forEach((availability) => {
        map.get(availability.employeeId)?.push(availability);
      });

      return employeeIds.map((id) => map.get(id)!);
    },
  ),
});
