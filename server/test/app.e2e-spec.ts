import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { Server } from 'http';
import { AppModule } from './../src/app.module';

interface EmployeesQueryResponse {
  data: {
    employees: Array<{
      id: string;
      name: string;
      email: string;
    }>;
  };
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer() as Server;
  });

  it('GraphQL (Query employees)', async () => {
    const res = await request(server)
      .post('/graphql')
      .send({
        query: `{ employees { id name email } }`,
      })
      .expect(200);

    const body = res.body as EmployeesQueryResponse;

    expect(body.data.employees).toHaveLength(body.data.employees.length);
    expect(Array.isArray(body.data.employees)).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
