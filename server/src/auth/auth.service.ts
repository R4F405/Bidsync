import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Valida si un usuario existe y la contraseña es correcta.
   * @param email Email del usuario.
   * @param pass Contraseña en texto plano.
   * @returns El usuario si la validación es exitosa, sino null.
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Maneja el login y la firma de un nuevo JWT.
   * @param user Objeto del usuario (sin el hash).
   * @returns Un objeto con el access_token.
   */
  async login(user: Omit<User, 'passwordHash'>) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Maneja el registro de un nuevo usuario.
   * @param registerDto Objeto con email y password.
   * @returns El usuario creado (sin el hash).
   */
  async register(registerDto: Record<string, any>) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new UnauthorizedException('Email already in use');
    }

    // Usamos 'passwordHash' como clave, aunque recibimos 'password', porque el servicio de usuario lo hasheará.
    const user = await this.usersService.create({
      email: registerDto.email,
      passwordHash: registerDto.password, // El servicio se encarga del hash
      name: registerDto.name,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }
}