import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // No roles required : allow
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context);
    const request = gqlContext.getContext<{ req: Request }>().req;
    const user = request?.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User does not have required roles');
    }

    const hasRole = requiredRoles.some((role) => user.role!.includes(role));

    if (!hasRole) {
      throw new ForbiddenException(
        `User roles [${user.role.join(', ')}] are not authorized`,
      );
    }

    return true;
  }
}
