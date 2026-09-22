import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { SearchUserDto } from './dto/search-user.dto.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  search(@Query() dto: SearchUserDto) {
    return this.usersService.search(dto.query);
  }
}
