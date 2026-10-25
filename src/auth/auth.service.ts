import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username?: string, password?: string) {
    if (!username || !password) {
      throw new BadRequestException('Вкажіть логін та пароль');
    }

    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Невірний логін або пароль');
    }

    // Підтримка як bcrypt-хешу, так і текстового пароля з dashboard_mock.sql
    const isBcryptHash = user.password.startsWith('$2');
    const isPasswordValid = isBcryptHash
      ? await bcrypt.compare(password, user.password)
      : user.password === password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Невірний логін або пароль');
    }

    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });

    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }

  async register(username?: string, password?: string) {
    if (!username || !password) {
      throw new BadRequestException('Вкажіть логін та пароль');
    }

    const existing = await this.usersService.findByUsername(username);
    if (existing) {
      throw new ConflictException('Користувач із таким логіном вже існує');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = randomBytes(8).toString('base64url').slice(0, 11);

    const user = await this.usersService.create({
      id,
      username,
      password: hashedPassword,
    });

    const token = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
    });

    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }
}
