#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/919c4888ab737e6b8f442c46c50c9b24a3110d8126366e8684826604894d75e5/contract';
import endContract from '../../snapshots/919c4888ab737e6b8f442c46c50c9b24a3110d8126366e8684826604894d75e5/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'friendship',
        columns: [
          col('addresseeId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('requesterId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'friendship_status_check_f0e5c74c',
            "\"status\" IN ('PENDING', 'ACCEPTED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'group',
        columns: [
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'groupMember',
        columns: [
          col('groupId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['groupId', 'userId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'pin',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('lat', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('long', 'float8', { notNull: true, codecRef: { codecId: 'pg/float8@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('ownerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'pinShareGroup',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('groupId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('pinId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['pinId', 'groupId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'pinShareUser',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('pinId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('userId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['pinId', 'userId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'user',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('realName', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('username', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'friendship',
        constraint: 'friendship_requesterId_addresseeId_key',
        columns: ['requesterId', 'addresseeId'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'user',
        constraint: 'user_username_key',
        columns: ['username'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'friendship',
        index: 'friendship_addresseeId_idx_d745efab',
        columns: ['addresseeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'friendship',
        index: 'friendship_requesterId_idx_a5f4af92',
        columns: ['requesterId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'group',
        index: 'group_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'groupMember',
        index: 'groupMember_groupId_idx_e2fb5578',
        columns: ['groupId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'groupMember',
        index: 'groupMember_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pin',
        index: 'pin_ownerId_idx_e2d0c1ef',
        columns: ['ownerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pinShareGroup',
        index: 'pinShareGroup_groupId_idx_e2fb5578',
        columns: ['groupId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pinShareGroup',
        index: 'pinShareGroup_pinId_idx_77bab7d3',
        columns: ['pinId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pinShareUser',
        index: 'pinShareUser_pinId_idx_77bab7d3',
        columns: ['pinId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'pinShareUser',
        index: 'pinShareUser_userId_idx_a489d58a',
        columns: ['userId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'friendship',
        foreignKey: {
          name: 'friendship_requesterId_fkey',
          columns: ['requesterId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'friendship',
        foreignKey: {
          name: 'friendship_addresseeId_fkey',
          columns: ['addresseeId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'group',
        foreignKey: {
          name: 'group_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'groupMember',
        foreignKey: {
          name: 'groupMember_groupId_fkey',
          columns: ['groupId'],
          references: { schema: 'public', table: 'group', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'groupMember',
        foreignKey: {
          name: 'groupMember_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pin',
        foreignKey: {
          name: 'pin_ownerId_fkey',
          columns: ['ownerId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pinShareGroup',
        foreignKey: {
          name: 'pinShareGroup_pinId_fkey',
          columns: ['pinId'],
          references: { schema: 'public', table: 'pin', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pinShareGroup',
        foreignKey: {
          name: 'pinShareGroup_groupId_fkey',
          columns: ['groupId'],
          references: { schema: 'public', table: 'group', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pinShareUser',
        foreignKey: {
          name: 'pinShareUser_pinId_fkey',
          columns: ['pinId'],
          references: { schema: 'public', table: 'pin', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'pinShareUser',
        foreignKey: {
          name: 'pinShareUser_userId_fkey',
          columns: ['userId'],
          references: { schema: 'public', table: 'user', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
