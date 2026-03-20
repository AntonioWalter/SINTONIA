import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiService implements OnModuleInit {
  private readonly logger = new Logger(AiService.name);
  
  // Variabili caricate dal file .env
  private readonly aiApiUrl = process.env.AI_API_URL;
  private readonly hfToken = process.env.HF_TOKEN;

  constructor(private readonly httpService: HttpService) {
    // Log di controllo all'avvio del servizio
    this.logger.log('--- COSTRUTTORE AiService ---');
  }

  onModuleInit() {
    this.logger.log('--- ON_MODULE_INIT AiService ---');
    this.logger.log(`URL configurato: ${this.aiApiUrl ? this.aiApiUrl : 'NON TROVATO ❌'}`);
    this.logger.log(`Token configurato: ${this.hfToken ? 'PRESENTE ✅' : 'MANCANTE ❌'}`);
  }

  /**
   * Predict: Invia i dati a un modello specifico e restituisce la risposta.
   */
  async predict(endpoint: string, payload: any): Promise<any> {
    this.logger.log(`[DEBUG] Inizio procedura predict per endpoint: ${endpoint}`);

    // 1. Controllo se l'URL esiste
    if (!this.aiApiUrl) {
      this.logger.error('[DEBUG ERROR] AI_API_URL è undefined. Controlla che il file .env sia nella cartella backend/ e che le variabili siano caricate.');
      return null;
    }

    try {
      // 2. Costruzione URL e invio richiesta
      const url = `${this.aiApiUrl}/api/${endpoint}`;
      this.logger.log(`[DEBUG] Chiamata POST a: ${url}`);
      this.logger.log(`[DEBUG] Payload inviato: ${JSON.stringify(payload)}`);

      // 3. Chiamata HTTP con headers (incluso il token HF)
      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      // 4. Log della risposta riuscita
      this.logger.log(`[DEBUG] Risposta ricevuta con successo!`);
      this.logger.log(`[DEBUG] Dati ricevuti: ${JSON.stringify(response.data)}`);
      
      return response.data;

    } catch (error: any) {
      // 5. Log dettagliato dell'errore
      this.logger.error(`[DEBUG ERROR] Errore durante la chiamata IA [${endpoint}]`);
      
      if (error.response) {
        // L'IA ha risposto con un errore (es. 401, 404, 500)
        this.logger.error(`Stato Errore: ${error.response.status}`);
        this.logger.error(`Messaggio Errore: ${JSON.stringify(error.response.data)}`);
      } else {
        // Errore di rete o il server IA non risponde
        this.logger.error(`Messaggio Errore: ${error.message}`);
      }
      
      return null;
    }
  }

  /**
   * Predict Genetic Algorithm: Invia le feature estratte all'endpoint del GA
   */
  async predictGeneticAlgorithm(payload: any): Promise<any> {
    this.logger.log(`[DEBUG] Inizio procedura predict per Algoritmo Genetico`);

    if (!this.aiApiUrl) {
      this.logger.error('[DEBUG ERROR] AI_API_URL è undefined. Controlla le variabili d\'ambiente.');
      return null;
    }

    try {
      const url = `${this.aiApiUrl}/api/genetic-algorithm`;
      this.logger.log(`[DEBUG] Chiamata POST a: ${url}`);
      this.logger.log(`[DEBUG] Payload GA inviato: ${JSON.stringify(payload)}`);

      const response = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            'Authorization': `Bearer ${this.hfToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`[DEBUG] Strategia Genetica ricevuta con successo!`);
      this.logger.log(`[DEBUG] Dati Strategia: ${JSON.stringify(response.data)}`);
      
      return response.data;

    } catch (error: any) {
      this.logger.error(`[DEBUG ERROR] Errore durante la chiamata IA [genetic-algorithm]`);
      
      if (error.response) {
        this.logger.error(`Stato Errore: ${error.response.status}`);
        this.logger.error(`Messaggio Errore: ${JSON.stringify(error.response.data)}`);
      } else {
        this.logger.error(`Messaggio Errore: ${error.message}`);
      }
      
      return null;
    }
  }

  /**
   * Pre-Warming: Invia un segnale per "svegliare" lo Space.
   */
  wakeUpModels(): void {
    if (!this.aiApiUrl) return;
    this.logger.log(`[DEBUG] Tentativo di risveglio Space: ${this.aiApiUrl}`);
    
    // Fire and forget, ignora gli errori se sta già rispondendo
    this.httpService.axiosRef.get(this.aiApiUrl).catch(() => {});
  }

  // Coda di traduzione (Anti-Ban per Google Translate: max 5 chiamate/minuto)
  private translationQueue: Array<{ text: string, resolve: (value: string) => void }> = [];
  private isTranslating = false;
  private readonly TRANSLATION_DELAY_MS = 12500; // 12.5 secondi per garantire margine sulle 5/minuto

  /**
   * Mette in coda una traduzione dall'italiano all'inglese usando Google Translate.
   * Il sistema processerà la coda ad un ritmo costante per evitare ban dell'IP.
   * @param text - Il testo in italiano da tradurre
   * @returns Il testo tradotto in inglese come Promise
   */
  async translateToEnglish(text: string): Promise<string> {
    return new Promise((resolve) => {
      this.translationQueue.push({ text, resolve });
      this.processTranslationQueue();
    });
  }

  /**
   * Motore di processamento della coda (Leaky Bucket) a 12.5 secondi
   */
  private async processTranslationQueue() {
    // Se sta già traducendo o la coda è vuota, si ferma. (Il timeout sveglierà il prossimo)
    if (this.isTranslating || this.translationQueue.length === 0) {
      return;
    }

    this.isTranslating = true;
    const { text, resolve } = this.translationQueue.shift()!;

    try {
      this.logger.log(`[TRANSLATE QUEUE] Processando traduzione. Elementi in attesa: ${this.translationQueue.length}`);
      
      const translateModule = await (Function('return import("google-translate-api-x")')() as Promise<any>);
      const translate = translateModule.default || translateModule.translate;
      
      const result = await translate(text, { from: 'it', to: 'en' });
      
      this.logger.log(`[TRANSLATE] Originale (IT): "${text.substring(0, 50)}..." -> EN: "${result.text.substring(0, 50)}..."`);
      resolve(result.text);
    } catch (error: any) {
      this.logger.error(`[TRANSLATE ERROR] Errore API: ${error.message}. Procedo con invio no-translate come fallback.`);
      resolve(text); // Fallback al testo originale per permettere all'AI di tentare comunque l'analisi (l'AI supporta multilingua degradato)
    } finally {
      if (this.translationQueue.length > 0) {
        this.logger.log(`[TRANSLATE QUEUE] Sleep 12.5s attivato per evitare Rate-Limit (Google Ban).`);
        setTimeout(() => {
          this.isTranslating = false;
          this.processTranslationQueue(); // Processa il prossimo
        }, this.TRANSLATION_DELAY_MS);
      } else {
        this.isTranslating = false; // Ferma il loop
      }
    }
  }
}