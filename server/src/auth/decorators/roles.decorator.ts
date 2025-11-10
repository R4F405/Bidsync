import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

// Esta clave la usaremos para leer los metadatos en nuestro Guard
export const ROLES_KEY = 'roles';

/**
 * Decorador para asignar roles requeridos a un endpoint.
 * @param roles Lista de roles permitidos (ej. Role.ADMIN)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);