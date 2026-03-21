import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { db } from '../drizzle/db.js';
import { paziente, notifica, questionario } from '../drizzle/schema.js';
import { eq, isNull, and } from 'drizzle-orm';

@Injectable()
export class NotificationExecutorService {
  private readonly logger = new Logger(NotificationExecutorService.name);

  // 1. IL CERVELLO EDITORIALE: Il dizionario dei testi delle notifiche
  private readonly MESSAGES = {
    Questionario: [
      { titolo: 'Nuovo Questionario', desc: 'Hai un questionario in attesa di compilazione. Richiede solo pochi minuti.' },
      { titolo: 'Nuovo Questionario Disponibile', desc: "C'è un nuovo questionario pronto per te. Aiutaci a monitorare i tuoi progressi." }
    ],
    Promemoria: [
      { titolo: 'Come ti senti?', desc: 'Non hai ancora registrato il tuo umore oggi. Aggiorna il diario!' },
      { titolo: 'Momento Riflessione', desc: 'È un ottimo momento per scrivere una pagina di diario.' }
    ],
    Motivazionale: [
      { titolo: 'Siamo fieri di te', desc: 'Ogni giorno è una nuova opportunità. Continua così!' },
      { titolo: 'Un passo alla volta', desc: 'Ricorda che chiedere aiuto è un segno di forza, non di debolezza.' }
    ],
    Informativa: [
      { titolo: 'Lo sapevi?', desc: 'Scrivere i propri pensieri riduce lo stress del 20%.' },
      { titolo: 'Nuovi Traguardi', desc: 'Scopri come guadagnare il nuovo badge della settimana nella sezione obiettivi.' }
    ]
  };

  // 2. IL CRON JOB ORARIO: Gira esattamente al minuto 0 di ogni ora (es. 09:00, 10:00)
  @Cron(CronExpression.EVERY_HOUR) 
  async handleHourlyNotifications() {
    this.logger.log('--- [START] Controllo Orario Invio Notifiche ---');
    const currentHour = new Date().getHours();

    try {
      // Prendi tutti i pazienti attivi
      const activePatients = await db.select().from(paziente).where(eq(paziente.stato, true));

      for (const p of activePatients) {
        const strategy = p.strategiaAttuale as any;
        
        // Se il paziente non ha ancora una strategia calcolata, saltiamo
        if (!strategy || !strategy.orari_attivi || !strategy.tipologia) continue;

        // Se l'orario attuale (es. 10) è presente nell'array degli orari del paziente (es. [10, 15, 20])
        if (strategy.orari_attivi.includes(currentHour)) {
          await this.processAndSaveNotification(p.idPaziente, strategy.tipologia);
        }
      }
      this.logger.log('--- [COMPLETED] Controllo Orario Terminato ---');
    } catch (error) {
      this.logger.error('Errore critico durante la generazione delle notifiche orarie', error);
    }
  }

  // 3. LA LOGICA DI CONTROLLO E FALLBACK
  private async processAndSaveNotification(patientId: string, intendedType: string) {
    let finalType = intendedType;

    // Se l'IA ha suggerito un Questionario, controlliamo se esiste davvero!
    if (intendedType === 'Questionario') {
      
      // Cerchiamo un questionario assegnato a questo paziente ma senza risposte (quindi da compilare)
      const pendingQuestionnaires = await db.select().from(questionario)
        .where(and(
          eq(questionario.idPaziente, patientId),
          isNull(questionario.risposte) // Assumiamo che se 'risposte' è null, non è stato compilato
        ));

      // Se non ci sono questionari in sospeso, attiviamo il PIANO B
      if (pendingQuestionnaires.length === 0) {
        this.logger.debug(`Paziente ${patientId} non ha questionari in sospeso. Fallback attivato: Promemoria.`);
        finalType = 'Promemoria'; // Declassiamo la notifica a un semplice promemoria
      }
    }

    // 4. PESCA IL MESSAGGIO E SALVALO
    // Prendiamo l'array di opzioni in base alla tipologia finale
    const options = this.MESSAGES[finalType as keyof typeof this.MESSAGES];
    // Scegliamo un messaggio casuale tra quelli disponibili per non essere ripetitivi
    const randomMsg = options[Math.floor(Math.random() * options.length)];

    try {
      // Inseriamo fisicamente la riga nel DB
      await db.insert(notifica).values({
        titolo: randomMsg.titolo,
        descrizione: randomMsg.desc,
        tipologia: finalType as 'Promemoria' | 'Motivazionale' | 'Informativa' | 'Questionario',
        idPaziente: patientId,
        letto: false,
        dataInvio: new Date()
      });

      this.logger.log(`✅ Notifica [${finalType}] inserita nel DB per il paziente ${patientId}`);
    } catch (error) {
      this.logger.error(`❌ Errore salvataggio notifica per ${patientId}`, error);
    }
  }
}