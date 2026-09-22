import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { or } from '@prisma/orm-postgres/orm-client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    const user = await this.prisma.db.orm.public.User.where((u) =>
      or(u.email.eq(query.toLowerCase()), u.username.eq(query.toLowerCase())),
    ).first();

    if (!user) throw new NotFoundException('User not found');

    return {
      id: user.id,
      username: user.username,
    };
  }
}
