import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    // Obtenemos la variable de entorno
    const secret = process.env.JWT_SECRET;

    // Lanzamos un error si no está definida
    // Esto detendrá el inicio de la aplicación, lo cual es bueno (fail-fast).
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not set in environment variables. Please check your .env file.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Usamos la variable validada
    });
  }

  /**
   * Passport valida el token y luego llama a este método.
   * El objeto que devolvemos aquí se adjuntará a `request.user`.
   */
  async validate(payload: { sub: string; email: string; role: string }) {
    // Por ahora, solo devolvemos el payload.
    // En una app más compleja, podríamos buscar el usuario en la BD aquí
    // para adjuntar el objeto User completo.
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}