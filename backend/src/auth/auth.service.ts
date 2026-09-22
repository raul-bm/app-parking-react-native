import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { JwtPayload } from './interfaces/jwt-payload.interface.js';
import { or } from '@prisma/orm-postgres/orm-client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const emailLowerCase = dto.email.toLowerCase();
    const userNameLowerCase = dto.username.toLowerCase();

    const existing = await this.prisma.db.orm.public.User.where((u) =>
      or(u.email.eq(emailLowerCase), u.username.eq(userNameLowerCase)),
    ).first();

    if (existing)
      throw new ConflictException('Email or username already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.db.orm.public.User.create({
      email: emailLowerCase,
      username: userNameLowerCase,
      realName: dto.realName,
      passwordHash: passwordHash,
    });

    const accessToken = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        realName: user.realName,
      },
      accessToken,
    };
  }

  async login(dto: LoginDto) {
    const identifierLowerCase = dto.identifier.toLowerCase();

    const user = await this.prisma.db.orm.public.User.where((u) =>
      or(u.email.eq(identifierLowerCase), u.username.eq(identifierLowerCase)),
    ).first();

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user?.passwordHash,
    );

    if (!passwordMatches)
      throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        realName: user.realName,
      },
      accessToken,
    };
  }

  private async validateUser(identifier: string, password: string) {}

  private generateToken(user: { id: string; email: string; username: string }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    return this.jwtService.sign(payload);
  }
}
