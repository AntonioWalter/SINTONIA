import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { DiaryPageDto } from './dto/diary-page.dto.js';
import { UpdateDiaryPageDto } from './dto/update-diary-page.dto.js';
import { db } from '../../drizzle/db.js';
import { paginaDiario, alertClinico } from '../../drizzle/schema.js';
import { eq, and } from 'drizzle-orm';
import { AiService } from '../../ai/ai.service.js'; // <-- Importa il servizio IA

@Injectable()
export class UpdateDiaryPageService {
    // Aggiungiamo il logger per la console
    private readonly logger = new Logger(UpdateDiaryPageService.name);

    // Iniettiamo l'AiService nel costruttore
    constructor(private readonly aiService: AiService) {}

    /**
     * Update an existing diary page for a patient
     * @param patientId - The UUID of the patient
     * @param pageId - The UUID of the diary page to update
     * @param dto - Updated data for the diary page
     * @returns The updated diary page
     */
    async updateDiaryPage(patientId: string, pageId: string, dto: UpdateDiaryPageDto): Promise<DiaryPageDto> {
        // Create DTO instance and validate
        const dtoInstance = Object.assign(new UpdateDiaryPageDto(), dto);
        const validationErrors = dtoInstance.validate();

        if (validationErrors.length > 0) {
            throw new BadRequestException({
                message: 'Errore di validazione',
                errors: validationErrors,
            });
        }

        // Check if the page exists and belongs to the patient
        const existingPage = await db
            .select()
            .from(paginaDiario)
            .where(and(
                eq(paginaDiario.idPaginaDiario, pageId),
                eq(paginaDiario.idPaziente, patientId)
            ))
            .limit(1);

        if (!existingPage || existingPage.length === 0) {
            throw new NotFoundException('Pagina del diario non trovata');
        }

        // Update the diary page
        const [updatedPage] = await db
            .update(paginaDiario)
            .set({
                titolo: dto.title.trim(),
                testo: dto.content.trim(),
            })
            .where(eq(paginaDiario.idPaginaDiario, pageId))
            .returning({
                id: paginaDiario.idPaginaDiario,
                title: paginaDiario.titolo,
                content: paginaDiario.testo,
                createdAt: paginaDiario.dataInserimento,
            });

        if (!updatedPage) {
            throw new BadRequestException('Impossibile aggiornare la pagina del diario');
        }

        // --- ANALISI NLP IN BACKGROUND (Red Flag Detection sull'Update) ---
        // Fire-and-forget: controlliamo il nuovo testo senza bloccare la risposta al frontend
        this.analyzeRiskAndAlert(patientId, dto.content.trim()).catch(err => {
            this.logger.error('Errore irreversibile durante l\'analisi NLP in fase di UPDATE', err);
        });

        return {
            id: updatedPage.id,
            title: updatedPage.title,
            content: updatedPage.content,
            createdAt: updatedPage.createdAt || new Date(),
        };
    }

    /**
     * Funzione privata asincrona per analizzare il testo tramite IA e generare l'allarme
     */
    private async analyzeRiskAndAlert(patientId: string, testo: string) {
        this.logger.log(`Inviando la pagina di diario modificata del paziente ${patientId} a SINTON-IA...`);
        
        try {
            // STEP 1: Traduzione IT → EN (il modello Red Flag funziona in inglese)
            this.logger.log(`[RED FLAG] Traduzione del testo in inglese in corso...`);
            const testoTradotto = await this.aiService.translateToEnglish(testo);

            // STEP 2: Chiamata all'API Python su Hugging Face con il testo tradotto
            const aiResponse = await this.aiService.predict('red-flag', { testo: testoTradotto });

            if (aiResponse && aiResponse.risk_detected) {
                this.logger.warn(`🚨 RED FLAG RILEVATA nell'aggiornamento per il paziente ${patientId}! Generazione alert in corso...`);

                // Inseriamo il record critico nella tabella alert_clinico.
                await db.insert(alertClinico).values({
                    idPaziente: patientId,
                    accettato: false
                });

                this.logger.log(`Alert Clinico globale salvato nel database per il Triage.`);
            } else {
                this.logger.log(`Nessuna anomalia rilevata nel diario aggiornato del paziente ${patientId}.`);
            }
        } catch (error: any) {
             this.logger.error(`Errore di comunicazione con il modello NLP: ${error.message}`);
        }
    }
}