import { Module } from '@nestjs/common';
import { PinsService } from './pins.service.js';
import { PinsController } from './pins.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({
  imports: [AuthModule],
  controllers: [PinsController],
  providers: [PinsService],
  exports: [PinsService],
})
export class PinsModule {}
