import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GeneticService } from './genetic.service.js'; // <-- Aggiunto .js
import { db } from '../drizzle/db.js'; // <-- Percorso corretto e .js
import { paziente } from '../drizzle/schema.js'; // <-- Percorso corretto e .js
import { eq } from 'drizzle-orm';

@Injectable()
export class StrategySchedulerService {
  private readonly logger = new Logger(StrategySchedulerService.name);

  constructor(private readonly geneticService: GeneticService) {}

  // Gira ogni lunedì alle 03:00 AM ('0 0 3 * * 1')
  @Cron('0 0 3 * * 1')
  async handleWeeklyStrategyUpdate() {
    this.logger.log('--- [START] Ottimizzazione Settimanale Strategie IA ---');

    try {
      // 1. Prendi tutti i pazienti attivi
      const activePatients = await db.select().from(paziente).where(eq(paziente.stato, true));
      
      this.logger.log(`Trovati ${activePatients.length} pazienti da ottimizzare.`);

      // 2. Calcola la strategia per ognuno
      for (const p of activePatients) {
        try {
          await this.geneticService.runAlgorithmForPatient(p.idPaziente);
          this.logger.log(`Strategia aggiornata con successo per: ${p.idPaziente}`);
        } catch (err) {
          this.logger.error(`Fallimento ottimizzazione per paziente ${p.idPaziente}:`, err);
        }
      }

      this.logger.log('--- [COMPLETED] Ottimizzazione Settimanale Conclusa ---');
    } catch (error) {
      this.logger.error('Errore critico nello scheduler GA:', error);
    }
  }
}