import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from 'express';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/jwt.guard';
import { ConfigModule } from '@nestjs/config';
import { createLoaders } from './common/loaders';
import { AbsenceService } from './team-scheduling/absence/absence.service';
import { AvailabilityService } from './team-scheduling/availability/availability.service';
import { TeamSchedulingModule } from './team-scheduling/team-scheduling.module';
import { TeamSkillsModule } from './team-skills/team-skills.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [TeamSchedulingModule],
      useFactory: (
        absenceService: AbsenceService,
        availabilityService: AvailabilityService,
      ) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        sortSchema: true,
        playground: true,
        context: ({ req }: { req: Request }) => ({
          req,
          loaders: createLoaders(absenceService, availabilityService),
        }),
      }),
      inject: [AbsenceService, AvailabilityService],
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/sqlite.db',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TeamSchedulingModule,
    TeamSkillsModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 600,
      max: 100,
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
