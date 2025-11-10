import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtenemos los roles requeridos del decorador @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no se especifican roles en el endpoint, se permite el acceso.
    // Esto es crucial para que endpoints públicos (login, register) sigan funcionando.
    if (!requiredRoles) {
      return true;
    }

    // Obtenemos el usuario que el JwtAuthGuard adjuntó a la request
    const { user } = context.switchToHttp().getRequest();

    // Si no hay usuario (JwtAuthGuard no se usó) o no tiene rol, denegar
    if (!user || !user.role) {
      return false;
    }

    // Comprobamos si el rol del usuario está en la lista de roles requeridos
    return requiredRoles.some((role) => user.role === role);
  }
}