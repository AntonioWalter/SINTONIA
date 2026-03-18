import { Injectable, Logger } from '@nestjs/common';
import { AiService } from './ai.service.js'; // Assicurati che il percorso sia corretto
import { db } from '../drizzle/db.js'; 
import { paziente, statoAnimo, notifica, paginaDiario } from '../drizzle/schema.js';
import { eq, and, gte, desc } from 'drizzle-orm';

@Injectable()
export class GeneticService {
  private readonly logger = new Logger(GeneticService.name);

  // Mappatura delle valenze dell'umore (Identica a Python!)
  private readonly VA_MAP: Record<string, number> = {
    Felice: 0.85, Sereno: 0.7, Energico: 0.5, Neutro: 0.0,
    Stanco: -0.2, Triste: -0.8, Ansioso: -0.55, Arrabbiato: -0.7,
    Spaventato: -0.65, Confuso: -0.3,
  };

  constructor(private readonly aiService: AiService) {}

  async runAlgorithmForPatient(patientId: string) {
    this.logger.log(`Calcolo parametri GA per il paziente: ${patientId}`);
    
    // Data di 7 giorni fa
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. ESTRAZIONE DATI: UMORE (Ultimi 7 giorni)
    const recentMoods = await db.select().from(statoAnimo)
      .where(and(
        eq(statoAnimo.idPaziente, patientId),
        gte(statoAnimo.dataInserimento, sevenDaysAgo)
      ));

    let moodFrequency = recentMoods.length;
    let avgMoodValence = 0;

    if (moodFrequency > 0) {
      const sumValence = recentMoods.reduce((sum, record) => {
        return sum + (this.VA_MAP[record.umore] || 0);
      }, 0);
      avgMoodValence = sumValence / moodFrequency;
    } else {
      // Valori di default se non ci sono dati nella settimana
      moodFrequency = 0;
      avgMoodValence = 0.5; // Valore neutro/medio
    }

    // Normalizziamo la frequenza (es. diviso 7 giorni, massimo 1.0)
    const normalizedMoodFreq = Math.min(moodFrequency / 7, 1.0);

    // 2. ESTRAZIONE DATI: NOTIFICHE LETTE (Ultime 15 come da tua logica)
    const recentNotifs = await db.select().from(notifica)
      .where(eq(notifica.idPaziente, patientId))
      .orderBy(desc(notifica.dataInvio))
      .limit(15);

    let notificationReadRate = 0.5; // Default se non ha mai ricevuto notifiche
    if (recentNotifs.length > 0) {
      const readCount = recentNotifs.filter(n => n.letto).length;
      notificationReadRate = readCount / recentNotifs.length;
    }

    // 3. ESTRAZIONE DATI: ATTIVITÀ NOTTURNA
    // Uniamo gli orari di inserimento di diari e umori degli ultimi 7 giorni
    const recentDiaries = await db.select({ dataInserimento: paginaDiario.dataInserimento })
      .from(paginaDiario)
      .where(and(eq(paginaDiario.idPaziente, patientId), gte(paginaDiario.dataInserimento, sevenDaysAgo)));
    
    const allActivities = [
      ...recentMoods.map(m => m.dataInserimento),
      ...recentDiaries.map(d => d.dataInserimento)
    ].filter(d => d !== null) as Date[];

    let nightActivityRate = 0.0;
    if (allActivities.length > 0) {
      const nightHours = [23, 0, 1, 2, 3, 4, 5, 6];
      const nightActions = allActivities.filter(date => nightHours.includes(date.getHours()));
      nightActivityRate = nightActions.length / allActivities.length;
    }

    // 4. CREAZIONE DEL PAYLOAD PER HUGGING FACE
    const payload = {
      mood_frequency_7d: normalizedMoodFreq,
      avg_mood_valence_7d: avgMoodValence,
      notification_read_rate: notificationReadRate,
      night_activity_rate: nightActivityRate
    };

    this.logger.debug(`Payload inviato a HF: ${JSON.stringify(payload)}`);

    try {
      // 5. CHIAMATA A HUGGING FACE (Tramite il tuo AiService)
      const strategy = await this.aiService.predictGeneticAlgorithm(payload);
      
      this.logger.log(`Strategia ricevuta: ${JSON.stringify(strategy)}`);

      // 6. SALVATAGGIO NEL DATABASE
      await db.update(paziente)
        .set({ 
          strategiaAttuale: strategy,
          dataAggiornamentoStrategia: new Date()
        })
        .where(eq(paziente.idPaziente, patientId));

      return strategy;
      
    } catch (error) {
      this.logger.error(`Errore durante l'esecuzione del GA per ${patientId}`, error);
      throw error;
    }
  }
}