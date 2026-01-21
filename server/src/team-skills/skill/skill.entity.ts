import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { EmployeeSkill } from '../employee-skill/employee-skill.entity';

@ObjectType()
@Entity('skills')
export class Skill {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  name: string;

  @Field()
  @Column()
  category: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field()
  @Column({ default: false })
  archived: boolean;

  @Field(() => [EmployeeSkill])
  @OneToMany(() => EmployeeSkill, (employeeSkill) => employeeSkill.skill, {
    cascade: true,
  })
  employeeSkills: EmployeeSkill[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
