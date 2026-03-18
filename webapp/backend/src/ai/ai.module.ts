import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { AiService } from './ai.service.js';
import { GeneticService } from './genetic.service.js';
import { StrategySchedulerService } from './strategy-scheduler.service.js'; 
import { NotificationExecutorService } from './notification-executor.service.js'; // <-- 1. IMPORTATO QUI

@Global()
@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    AiService,
    GeneticService,
    StrategySchedulerService,
    NotificationExecutorService // <-- 2. REGISTRATO QUI
  ],
  exports: [
    AiService,
    GeneticService
  ],
})
export class AiModule {}