import { Controller, Post, Body, UnauthorizedException, HttpCode, HttpStatus, UseGuards, Get, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Inicia sesión y devuelve un token JWT.
   * @param signInDto Contiene las credenciales del usuario.
   * @returns Un objeto que contiene el token JWT.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() signInDto: Record<string, any>) {
    const user = await this.authService.validateUser(
      signInDto.email,
      signInDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  /**
   * Registra un nuevo usuario.
   * @param registerDto Contiene los datos del nuevo usuario.
   * @returns El usuario creado (sin el hash de la contraseña).
   */
  @Post('register')
  async register(@Body() registerDto: Record<string, any>) {
    if (!registerDto.email || !registerDto.password) {
      throw new UnauthorizedException('Email and password are required');
    }
    return this.authService.register(registerDto);
  }

  /**
   * Endpoint protegido que solo devuelve los datos del usuario
   * si el token JWT es válido.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}