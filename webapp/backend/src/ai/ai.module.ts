import { Module, Global } from '@nestjs/common';
import { AiService } from './ai.service.js';
import { HttpModule } from '@nestjs/axios';

@Global() // Lo rendiamo globale così non devi importarlo ovunque
@Module({
  imports: [HttpModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
