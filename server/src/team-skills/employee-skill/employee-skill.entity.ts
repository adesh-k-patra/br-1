import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { Skill } from '../skill/skill.entity';

@ObjectType()
@Entity('employee_skills')
@Unique(['employeeId', 'skillId'])
export class EmployeeSkill {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  employeeId: string;

  @Field()
  @Column()
  skillId: string;

  @Field(() => Int)
  @Column({ type: 'int' })
  level: number;

  @Field(() => Skill)
  @ManyToOne(() => Skill, (skill) => skill.employeeSkills, {
    onDelete: 'CASCADE',
  })
  skill: Skill;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
