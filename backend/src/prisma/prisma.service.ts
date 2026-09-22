import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { db } from './db.js';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly db = db;

  async onModuleInit() {}

  async onModuleDestroy() {
    await this.db.close();
  }
}
