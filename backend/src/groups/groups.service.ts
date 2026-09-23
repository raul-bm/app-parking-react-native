import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGroupDto } from './dto/create-group.dto.js';
import { and, or } from '@prisma/orm-postgres/orm-client';
import { UpdateGroupDto } from './dto/update-group.dto.js';
import { AddMemberDto } from './dto/add-member.dto.js';

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGroupDto, userId: string) {
    const group = await this.prisma.db.orm.public.Group.create({
      name: dto.name,
      ownerId: userId,
    });

    return group;
  }

  async findAllMine(userId: string) {
    const ownedGroups = await this.prisma.db.orm.public.Group.where((g) =>
      g.ownerId.eq(userId),
    ).all();

    const memberships = await this.prisma.db.orm.public.GroupMember.where(
      (gm) => gm.userId.eq(userId),
    ).all();
    const memberGroupsIds = memberships.map((m) => m.groupId);

    const memberGroups =
      memberGroupsIds.length > 0
        ? await this.prisma.db.orm.public.Group.where((g) =>
            g.id.in(memberGroupsIds),
          ).all()
        : [];

    const allGroups = [...ownedGroups, ...memberGroups];
    return [...new Map(allGroups.map((g) => [g.id, g])).values()];
  }

  async findOne(groupId: string, userId: string) {
    const group = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!group) throw new NotFoundException('Group not found');

    if (group.ownerId === userId) return group;

    const groupMember = await this.prisma.db.orm.public.GroupMember.where(
      (gm) => and(gm.groupId.eq(groupId), gm.userId.eq(userId)),
    ).first();

    if (groupMember) return group;

    throw new ForbiddenException('Not authorized');
  }

  async update(groupId: string, dto: UpdateGroupDto, userId: string) {
    const group = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== userId)
      throw new ForbiddenException('Not authorized');

    const updated = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).update({
      name: dto.name,
    });

    return updated;
  }

  async remove(groupId: string, userId: string) {
    const group = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== userId)
      throw new ForbiddenException('Not authorized');

    await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).delete();
  }

  async addMember(groupId: string, dto: AddMemberDto, userId: string) {
    const group = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!group) throw new NotFoundException('Group not found');
    if (group.ownerId !== userId)
      throw new ForbiddenException('Not authorized');

    const targetUser = await this.prisma.db.orm.public.User.where((u) =>
      u.id.eq(dto.userId),
    ).first();

    if (!targetUser) throw new NotFoundException('User not found');

    if (dto.userId === group.ownerId)
      throw new BadRequestException('Owner is already a member');
    if (dto.userId === userId)
      throw new BadRequestException('Cannot add yourself');

    const existing = await this.prisma.db.orm.public.GroupMember.where((gm) =>
      and(gm.groupId.eq(groupId), gm.userId.eq(dto.userId)),
    ).first();

    if (existing)
      throw new BadRequestException('User already added to the group');

    const added = await this.prisma.db.orm.public.GroupMember.create({
      groupId: groupId,
      userId: dto.userId,
    });

    return added;
  }

  async removeMember(groupId: string, userIdToRemove: string, userId: string) {
    const group = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!group) throw new NotFoundException('Group not found');

    const targetUser = await this.prisma.db.orm.public.User.where((u) =>
      u.id.eq(userIdToRemove),
    ).first();

    if (!targetUser) throw new NotFoundException('User to remove not found');

    const groupMember = await this.prisma.db.orm.public.GroupMember.where(
      (gm) => and(gm.userId.eq(userIdToRemove), gm.groupId.eq(groupId)),
    ).first();

    if (group.ownerId === userId && userIdToRemove === userId)
      throw new ForbiddenException('Owner cannot leave their own group');

    if (!groupMember)
      throw new NotFoundException('User to remove not found in group');

    if (group.ownerId === userId) {
      if (userIdToRemove !== userId)
        await this.prisma.db.orm.public.GroupMember.where((gm) =>
          and(gm.groupId.eq(groupId), gm.userId.eq(userIdToRemove)),
        ).delete();
    } else {
      if (userIdToRemove !== userId)
        throw new ForbiddenException('Not authorized');
      else
        await this.prisma.db.orm.public.GroupMember.where((gm) =>
          and(gm.groupId.eq(groupId), gm.userId.eq(userId)),
        ).delete();
    }
  }

  async listMembers(groupId: string, userId: string) {
    const group = await this.prisma.db.orm.public.Group.where((g) =>
      g.id.eq(groupId),
    ).first();

    if (!group) throw new NotFoundException('Group not found');

    const groupMember = await this.prisma.db.orm.public.GroupMember.where(
      (gm) => and(gm.groupId.eq(groupId), gm.userId.eq(userId)),
    ).first();

    if (!groupMember && group.ownerId !== userId)
      throw new ForbiddenException('Not authorized');

    const members = await this.prisma.db.orm.public.GroupMember.where((gm) =>
      gm.groupId.eq(groupId),
    ).all();

    const membersUserIds = members.map((m) => m.userId);
    const memberUsersData =
      membersUserIds.length > 0
        ? await this.prisma.db.orm.public.User.where((u) =>
            u.id.in(membersUserIds),
          ).all()
        : [];

    const ownerData = await this.prisma.db.orm.public.User.where((u) =>
      u.id.eq(group.ownerId),
    ).first();

    return [
      { id: ownerData?.id, username: ownerData?.username, role: 'owner' },
      ...memberUsersData.map((u) => ({
        id: u.id,
        username: u.username,
        role: 'member',
      })),
    ];
  }
}
