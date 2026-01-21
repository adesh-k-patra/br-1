import { Resolver, Query, Args } from '@nestjs/graphql';
import { SkillsMatrixService } from './skills-matrix.service';
import { SkillsMatrix } from './skills-matrix.types';
import { MatrixFilterInput } from './skills-matrix.input';

@Resolver()
export class SkillsMatrixResolver {
  constructor(private readonly skillsMatrixService: SkillsMatrixService) {}

  @Query(() => SkillsMatrix, { name: 'skillsMatrix' })
  async getSkillsMatrix(
    @Args('filters', { nullable: true }) filters?: MatrixFilterInput,
  ): Promise<SkillsMatrix> {
    return this.skillsMatrixService.buildMatrix(filters);
  }

  @Query(() => String)
  exportSkillsMatrixCSV(
    @Args('filters', { nullable: true }) filters?: MatrixFilterInput,
  ): Promise<string> {
    return this.skillsMatrixService.exportCSV(filters);
  }
}
