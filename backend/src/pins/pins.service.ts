import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePinDto } from './dto/create-pin.dto.js';
import { and } from '@prisma/orm-postgres/orm-client';
import { UpdatePinDto } from './dto/update-pin.dto.js';
import { SharePinUserDto } from './dto/share-pin-user.dto.js';
import { SharePinGroupDto } from './dto/share-pin-group.dto.js';

@Injectable()
export class PinsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePinDto, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.create({
      lat: dto.lat,
      long: dto.long,
      note: dto.note,
      ownerId: userId,
    });

    return pin;
  }

  async findAllMine(userId: string) {
    const ownedPins = await this.prisma.db.orm.public.Pin.where((p) =>
      p.ownerId.eq(userId),
    ).all();

    return ownedPins;
  }

  async findSharedWithMe(userId: string) {
    const sharePinUserToMe = await this.prisma.db.orm.public.PinShareUser.where(
      (s) => s.userId.eq(userId),
    ).all();
    const sharePinUserToMePinsIds = sharePinUserToMe.map((s) => s.pinId);
    const sharePinUserToMePins =
      sharePinUserToMePinsIds.length > 0
        ? await this.prisma.db.orm.public.Pin.where((p) =>
            p.id.in(sharePinUserToMePinsIds),
          ).all()
        : [];

    const memberships = await this.prisma.db.orm.public.GroupMember.where((m) =>
      m.userId.eq(userId),
    ).all();
    const groupIds = memberships.map((m) => m.groupId);
    const sharePinGroupToMe =
      groupIds.length > 0
        ? await this.prisma.db.orm.public.PinShareGroup.where((s) =>
            s.groupId.in(groupIds),
          ).all()
        : [];
    const sharePinGroupToMePinsIds = [
      ...new Set(sharePinGroupToMe.map((s) => s.pinId)),
    ];
    const sharePinGroupToMePins =
      sharePinGroupToMePinsIds.length > 0
        ? await this.prisma.db.orm.public.Pin.where((p) =>
            p.id.in(sharePinGroupToMePinsIds),
          ).all()
        : [];

    const allPins = [...sharePinUserToMePins, ...sharePinGroupToMePins];
    const uniquePins = [
      ...new Map(allPins.map((pin) => [pin.id, pin])).values(),
    ];

    return uniquePins;
  }

  private async buildPinResponse(pin: any) {
    const sharedWithUsers = await this.prisma.db.orm.public.PinShareUser.where(
      (s) => s.pinId.eq(pin.id),
    ).all();

    const sharedWithGroups =
      await this.prisma.db.orm.public.PinShareGroup.where((s) =>
        s.pinId.eq(pin.id),
      ).all();

    return {
      ...pin,
      sharedWithUsers,
      sharedWithGroups,
    };
  }

  async findOne(pinId: string, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');

    const isOwner = pin.ownerId === userId;

    if (isOwner) return this.buildPinResponse(pin);

    const directShare = await this.prisma.db.orm.public.PinShareUser.where(
      (s) => and(s.pinId.eq(pinId), s.userId.eq(userId)),
    ).first();

    if (directShare) return this.buildPinResponse(pin);

    const groupShares = await this.prisma.db.orm.public.PinShareGroup.where(
      (s) => s.pinId.eq(pinId),
    ).all();

    for (const gs of groupShares) {
      const isMember = await this.prisma.db.orm.public.GroupMember.where((m) =>
        and(m.groupId.eq(gs.groupId), m.userId.eq(userId)),
      ).first();

      if (isMember) return this.buildPinResponse(pin);
    }

    throw new ForbiddenException('Not authorized');
  }

  async update(pinId: string, dto: UpdatePinDto, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');

    if (pin.ownerId !== userId) throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).update({
      note: dto.note,
    });

    return this.buildPinResponse(updated);
  }

  async remove(pinId: string, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');

    if (pin.ownerId !== userId) throw new ForbiddenException('Not authorized');

    await this.prisma.db.orm.public.Pin.where((p) => p.id.eq(pinId)).delete();
  }

  async shareWithUser(pinId: string, dto: SharePinUserDto, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');
    if (pin.ownerId !== userId) throw new ForbiddenException('Not authorized');

    const targetUser = await this.prisma.db.orm.public.User.where((u) =>
      u.id.eq(dto.userId),
    ).first();

    if (!targetUser) throw new NotFoundException('User not found');

    if (dto.userId === userId)
      throw new BadRequestException('Cannot share pin to yourself');

    const existing = await this.prisma.db.orm.public.PinShareUser.where((s) =>
      and(s.pinId.eq(pinId), s.userId.eq(dto.userId)),
    ).first();

    if (existing)
      throw new BadRequestException('Already shared with this user');

    const share = await this.prisma.db.orm.public.PinShareUser.create({
      pinId,
      userId: dto.userId,
    });

    return share;
  }

  async shareWithGroup(pinId: string, dto: SharePinGroupDto, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');
    if (pin.ownerId !== userId) throw new ForbiddenException('Not authorized');

    const targetGroup = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(dto.groupId),
    ).first();

    if (!targetGroup) throw new NotFoundException('Group not found');

    const isMember = await this.prisma.db.orm.public.GroupMember.where((m) =>
      and(m.groupId.eq(dto.groupId), m.userId.eq(userId)),
    ).first();

    if (!isMember)
      throw new ForbiddenException('You are not a user of this group');

    const existing = await this.prisma.db.orm.public.PinShareGroup.where((s) =>
      and(s.pinId.eq(pinId), s.groupId.eq(dto.groupId)),
    ).first();

    if (existing)
      throw new BadRequestException('Already shared with this group');

    const share = await this.prisma.db.orm.public.PinShareGroup.create({
      pinId,
      groupId: dto.groupId,
    });

    return share;
  }

  async unshareWithUser(
    pinId: string,
    userIdToUnshare: string,
    userId: string,
  ) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');
    if (pin.ownerId !== userId) throw new ForbiddenException('Not authorized');

    const userToUnshare = await this.prisma.db.orm.public.User.where((u) =>
      u.id.eq(userIdToUnshare),
    ).first();

    if (!userToUnshare)
      throw new NotFoundException('User to unshare not found');

    if (userIdToUnshare === userId)
      throw new ForbiddenException('Cannot share to yourself');

    const existing = await this.prisma.db.orm.public.PinShareUser.where((s) =>
      and(s.pinId.eq(pinId), s.userId.eq(userIdToUnshare)),
    ).first();

    if (!existing) throw new NotFoundException('Not shared with this user');

    await this.prisma.db.orm.public.PinShareUser.where((s) =>
      and(s.pinId.eq(pinId), s.userId.eq(userIdToUnshare)),
    ).delete();
  }

  async unshareWithGroup(pinId: string, groupId: string, userId: string) {
    const pin = await this.prisma.db.orm.public.Pin.where((p) =>
      p.id.eq(pinId),
    ).first();

    if (!pin) throw new NotFoundException('Pin not found');
    if (pin.ownerId !== userId) throw new ForbiddenException('Not authorized');

    const groupToUnshare = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!groupToUnshare) throw new NotFoundException('Group not found');

    const existing = await this.prisma.db.orm.public.PinShareGroup.where((s) =>
      and(s.pinId.eq(pinId), s.groupId.eq(groupId)),
    ).first();

    if (!existing) throw new NotFoundException('Not shared with this group');

    await this.prisma.db.orm.public.PinShareGroup.where((s) =>
      and(s.pinId.eq(pinId), s.groupId.eq(groupId)),
    ).delete();
  }
}