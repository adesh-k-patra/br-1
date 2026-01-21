import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { EmployeeSkill } from '../employee-skill/employee-skill.entity';
import { CriticalSkill } from './skills-matrix.types';
import { Inject, Injectable } from '@nestjs/common';

export interface CriticalityThresholds {
  minHolders: number;
  minExperts: number;
  expertLevel: number;
}

export const DEFAULT_THRESHOLDS: CriticalityThresholds = {
  minHolders: 2,
  minExperts: 2,
  expertLevel: 3,
};

@Injectable()
export class CriticalSkillsService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getCriticalSkills(
    skills: { id: string; name: string }[],
    assignments: EmployeeSkill[],
  ): Promise<CriticalSkill[]> {
    const key = this.cacheKey(skills.map(({ id }) => id));

    const cached = await this.cacheManager.get<CriticalSkill[]>(key);
    if (cached) {
      return cached;
    }

    const computed = this.detectCriticalSkills(
      skills.map(({ id, name }) => ({ id, name })),
      assignments,
      DEFAULT_THRESHOLDS,
    );

    await this.cacheManager.set(key, computed, 600);

    return computed;
  }

  async invalidate(): Promise<void> {
    await this.cacheManager.del('skills-matrix:critical-skills:v1:*');
  }

  private detectCriticalSkills(
    skills: { id: string; name: string }[],
    assignments: EmployeeSkill[],
    thresholds: CriticalityThresholds = DEFAULT_THRESHOLDS,
  ): CriticalSkill[] {
    const skillStats = new Map<string, { holders: number; experts: number }>();

    skills.forEach((skill) => {
      skillStats.set(skill.id, { holders: 0, experts: 0 });
    });

    assignments.forEach((assignment) => {
      const stats = skillStats.get(assignment.skillId);
      if (stats) {
        stats.holders++;
        if (assignment.level >= thresholds.expertLevel) {
          stats.experts++;
        }
      }
    });

    return skills.map((skill) => {
      const stats = skillStats.get(skill.id)!;
      const isCritical =
        stats.holders < thresholds.minHolders ||
        stats.experts < thresholds.minExperts;

      return {
        skillId: skill.id,
        skillName: skill.name,
        holderCount: stats.holders,
        expertCount: stats.experts,
        isCritical,
      };
    });
  }

  private cacheKey(skillIds: string[]): string {
    return [
      'skills-matrix:critical-skills:v1',
      skillIds.slice().sort().join('|'),
    ].join(':');
  }
}
