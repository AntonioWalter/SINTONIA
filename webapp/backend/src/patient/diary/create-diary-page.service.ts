import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { DiaryPageDto } from './dto/diary-page.dto.js';
import { CreateDiaryPageDto } from './dto/create-diary-page.dto.js';
import { db } from '../../drizzle/db.js';
import { paginaDiario, alertClinico } from '../../drizzle/schema.js';
import { BadgeService } from '../badge/badge.service.js';
import { AiService } from '../../ai/ai.service.js';

@Injectable()
export class CreateDiaryPageService {
    // Inizializziamo il logger per monitorare l'attività dell'IA in background
    private readonly logger = new Logger(CreateDiaryPageService.name);

    constructor(
        private readonly badgeService: BadgeService,
        private readonly aiService: AiService
    ) { }

    /**
     * Create a new diary page for a patient
     * @param patientId - The UUID of the patient
     * @param dto - Data for the new diary page
     * @returns The created diary page
     */
    async createDiaryPage(patientId: string, dto: CreateDiaryPageDto): Promise<DiaryPageDto> {
        this.validazione(dto);

        // 1. Inserisce la nuova pagina nel database
        const [insertedPage] = await db
            .insert(paginaDiario)
            .values({
                titolo: dto.title.trim(),
                testo: dto.content.trim(),
                idPaziente: patientId,
            })
            .returning({
                id: paginaDiario.idPaginaDiario,
                title: paginaDiario.titolo,
                content: paginaDiario.testo,
                createdAt: paginaDiario.dataInserimento,
            });

        if (!insertedPage) {
            throw new BadRequestException('Impossibile creare la pagina del diario');
        }

        // 2. Controlla e assegna badge guadagnati
        await this.badgeService.checkAndAwardBadges(patientId);

        // 3. ANALISI NLP IN BACKGROUND (Red Flag Detection)
        // Usiamo un costrutto "Fire-and-Forget": non usiamo await per non bloccare la risposta al frontend
        this.analyzeRiskAndAlert(patientId, dto.content.trim()).catch(err => {
            this.logger.error('Errore irreversibile durante l\'analisi NLP', err);
        });

        return {
            id: insertedPage.id,
            title: insertedPage.title,
            content: insertedPage.content,
            createdAt: insertedPage.createdAt || new Date(),
        };
    }

    /**
     * Funzione privata asincrona per analizzare il testo tramite IA e generare l'allarme
     */
    private async analyzeRiskAndAlert(patientId: string, testo: string) {
        this.logger.log(`Inviando la pagina di diario del paziente ${patientId} a SINTON-IA (Red Flag Detection)...`);
        
        try {
            // STEP 1: Traduzione IT → EN (il modello Red Flag funziona in inglese)
            this.logger.log(`[RED FLAG] Traduzione del testo in inglese in corso...`);
            const testoTradotto = await this.aiService.translateToEnglish(testo);

            // STEP 2: Chiamata all'API Python su Hugging Face con il testo tradotto
            const aiResponse = await this.aiService.predict('red-flag', { testo: testoTradotto });

            if (aiResponse && aiResponse.risk_detected) {
                this.logger.warn(`🚨 RED FLAG RILEVATA per il paziente ${patientId}! Generazione alert in corso...`);

                // Inseriamo il record critico nella tabella alert_clinico.
                await db.insert(alertClinico).values({
                    idPaziente: patientId,
                    accettato: false,
                    descrizione: `Contenuto a rischio rilevato nel diario: "${testo}"`
                });

                this.logger.log(`Alert Clinico globale salvato nel database per il Triage.`);
            } else {
                this.logger.log(`Nessuna anomalia rilevata nel diario del paziente ${patientId}.`);
            }
        } catch (error: any) {
             this.logger.error(`Errore di comunicazione con il modello NLP: ${error.message}`);
        }
    }

    validazione(dto: CreateDiaryPageDto): void {
        const dtoInstance = Object.assign(new CreateDiaryPageDto(), dto);

        if (!dtoInstance.title || dtoInstance.title.trim().length === 0) {
            throw new BadRequestException('Il titolo è obbligatorio');
        } else if (dtoInstance.title.length > 64) {
            throw new BadRequestException('Il titolo non può superare i 64 caratteri');
        }

        if (!dtoInstance.content || dtoInstance.content.trim().length === 0) {
            throw new BadRequestException('Il contenuto è obbligatorio');
        } else if (dtoInstance.content.length > 2000) {
            throw new BadRequestException('Il contenuto non può superare i 2000 caratteri');
        }
    }
}