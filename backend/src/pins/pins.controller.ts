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
import { PinsService } from './pins.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreatePinDto } from './dto/create-pin.dto.js';
import { UpdatePinDto } from './dto/update-pin.dto.js';
import { SharePinUserDto } from './dto/share-pin-user.dto.js';
import { SharePinGroupDto } from './dto/share-pin-group.dto.js';

@Controller('pins')
@UseGuards(JwtAuthGuard)
export class PinsController {
  constructor(private readonly pinsService: PinsService) {}

  @Post()
  create(@Body() dto: CreatePinDto, @Req() req: any) {
    return this.pinsService.create(dto, req.user.id);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.pinsService.findAllMine(req.user.id);
  }

  @Get('shared-with-me')
  findSharedWithMe(@Req() req: any) {
    return this.pinsService.findSharedWithMe(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.pinsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePinDto, @Req() req: any) {
    return this.pinsService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.pinsService.remove(id, req.user.id);
  }

  @Post(':id/share/user')
  @HttpCode(HttpStatus.CREATED)
  shareWithUser(
    @Param('id') id: string,
    @Body() dto: SharePinUserDto,
    @Req() req: any,
  ) {
    return this.pinsService.shareWithUser(id, dto, req.user.id);
  }

  @Post(':id/share/group')
  @HttpCode(HttpStatus.CREATED)
  shareWithGroup(
    @Param('id') id: string,
    @Body() dto: SharePinGroupDto,
    @Req() req: any,
  ) {
    return this.pinsService.shareWithGroup(id, dto, req.user.id);
  }

  @Delete(':id/share/user/:userIdToUnshare')
  @HttpCode(HttpStatus.NO_CONTENT)
  unshareWithUser(
    @Param('id') id: string,
    @Param('userIdToUnshare') userIdToUnshare: string,
    @Req() req: any,
  ) {
    return this.pinsService.unshareWithUser(id, userIdToUnshare, req.user.id);
  }

  @Delete(':id/share/user/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  unshareWithGroup(
    @Param('id') id: string,
    @Param('groupId') groupId: string,
    @Req() req: any,
  ) {
    return this.pinsService.unshareWithGroup(id, groupId, req.user.id);
  }
}
