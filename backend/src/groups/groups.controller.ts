import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { GroupsService } from './groups.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Body() dto: CreateGroupDto, @Req() req: any) {
    return this.groupsService.create(dto, req.user.id);
  }

  @Get()
  findAllMine(@Req() req: any) {
    return this.groupsService.findAllMine(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
    @Req() req: any,
  ) {
    return this.groupsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.remove(id, req.user.id);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @Req() req: any,
  ) {
    return this.groupsService.addMember(id, dto, req.user.id);
  }

  @Delete(':id/members/:userIdToRemove')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param('id') id: string,
    @Param('userIdToRemove') userIdToRemove: string,
    @Req() req: any,
  ) {
    return this.groupsService.removeMember(id, userIdToRemove, req.user.id);
  }

  @Get(':id/members')
  listMembers(@Param('id') id: string, @Req() req: any) {
    return this.groupsService.listMembers(id, req.user.id);
  }
}
