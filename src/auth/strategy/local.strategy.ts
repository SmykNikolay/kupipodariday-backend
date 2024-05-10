import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(getUsername: string, getPassword: string) {
    const user = await this.authService.validateAuth(getUsername, getPassword);

    if (!user) {
      throw new UnauthorizedException('Неверные учетные данные');
    }

    return user;
  }
}
