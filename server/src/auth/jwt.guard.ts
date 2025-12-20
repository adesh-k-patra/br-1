import {
  Injectable,
  UnauthorizedException,
  ExecutionContext,
  CanActivate,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

@Injectable()
export class JwtGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<{ req: Request }>().req;

    if (!request) {
      throw new UnauthorizedException('Request context missing');
    }

    // Dev Mode
    if (process.env.AUTH_MODE === 'dev') {
      request.user = {
        sub: 'dev-user',
        email: 'dev@local.test',
        role: ['manager'],
        scope: 'all',
      } satisfies JwtPayload;

      return true;
    }

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid Authorization header format');
    }

    const token = authHeader.slice(7);

    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) {
        throw new Error('Invalid JWT structure');
      }

      const decoded = JSON.parse(
        Buffer.from(payloadBase64, 'base64').toString('utf8'),
      ) as JwtPayload;

      request.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or malformed JWT token');
    }
  }
}
