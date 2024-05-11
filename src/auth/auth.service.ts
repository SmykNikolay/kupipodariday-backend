import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  async validateAuth(username: string, password: string) {
    const user = await this.usersService.findUserByName(username);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      delete user.password;
      return user;
    }
    return null;
  }

  async auth(user: User) {
    const payload = { ...user, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('SECRET_KEY'),
      }),
    };
  }
}
