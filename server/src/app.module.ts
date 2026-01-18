import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from 'express';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './auth/jwt.guard';
import { EmployeeModule } from './employee/employee.module';
import { AvailabilityModule } from './availability/availability.module';
import { AbsenceModule } from './absence/absence.module';
import { ScheduleModule } from './schedule/schedule.module';
import { ConfigModule } from '@nestjs/config';
import { createLoaders } from './common/loaders';
import { AbsenceService } from './absence/absence.service';
import { AvailabilityService } from './availability/availability.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [AbsenceModule, AvailabilityModule],
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
    EmployeeModule,
    AvailabilityModule,
    AbsenceModule,
    ScheduleModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
})
export class AppModule {}
