import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRoleEnum } from '../../../database/enums/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    let userTypeAllowed = this.reflector.get<UserRoleEnum[]>(
        'role',
        context.getHandler(),
    );
    if (!userTypeAllowed) {
      userTypeAllowed = this.reflector.get<UserRoleEnum[]>(
          'role',
          context.getClass(),
      );
      if (!userTypeAllowed) {
        return true;
      }
    }
    const userRole = request.user.role;

    if (Array.isArray(userRole)) {
      return userRole.some(role => userTypeAllowed.includes(role));
    } else {
      if (!userRole || !userTypeAllowed.includes(userRole)) {
        throw new HttpException('Permission error', HttpStatus.FORBIDDEN);
      }
      return true;
    }
  }
}
