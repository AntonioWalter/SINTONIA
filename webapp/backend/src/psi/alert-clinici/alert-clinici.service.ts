import { Injectable, ConflictException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from '../../drizzle/db.js';
import { alertClinico } from '../../drizzle/schema.js';

@Injectable()
export class AlertCliniciService {
    /**
     * Restituisce tutti gli alert clinici non ancora accettati
     * Questi alert sono visibili da tutti gli psicologi
     * @returns Lista di alert non accettati (solo dati della tabella alert_clinico)
     */
    async getAlertNonAccettati() {
        const rows = await db
            .select({
                idAlert: alertClinico.idAlert,
                dataAlert: alertClinico.dataAlert,
                stato: alertClinico.accettato,
                descrizione: alertClinico.descrizione, // Nuovo campo aggiunto
            })
            .from(alertClinico)
            .where(
                and(
                    eq(alertClinico.accettato, false),
                    eq(alertClinico.rifiutato, false) // 🛡️ Esclude quelli scartati
                )
            )
            .orderBy(alertClinico.dataAlert);

        return rows;
    }

    /**
     * Rifiuta un alert clinico (falso positivo identificato dallo psicologo)
     * @param idAlert - UUID dell'alert da rifiutare
     */
    async rifiutaAlert(idAlert: string) {
        const result = await db
            .update(alertClinico)
            .set({
                rifiutato: true,
            })
            .where(
                and(
                    eq(alertClinico.idAlert, idAlert),
                    eq(alertClinico.accettato, false) // Solo se non è stato già preso in carico
                )
            )
            .returning();

        return result[0];
    }

    /**
     * Accetta un alert clinico assegnandolo a uno psicologo
     * Gestisce race condition: solo il primo psicologo ad accettare avrà successo
     * @param idAlert - UUID dell'alert da accettare
     * @param codiceFiscalePsicologo - Codice fiscale dello psicologo che accetta
     * @returns Alert aggiornato
     * @throws ConflictException se l'alert è già stato accettato
     */
    async accettaAlert(idAlert: string, codiceFiscalePsicologo: string) {
        // Aggiorna l'alert solo se non è già stato accettato
        const result = await db
            .update(alertClinico)
            .set({
                accettato: true,
                idPsicologo: codiceFiscalePsicologo,
            })
            .where(
                and(
                    eq(alertClinico.idAlert, idAlert),
                    eq(alertClinico.accettato, false), // ⚠️ Critico: previene race condition
                ),
            )
            .returning();

        // Se nessuna riga è stata aggiornata, l'alert era già accettato
        if (result.length === 0) {
            throw new ConflictException(
                'Alert già accettato da un altro psicologo',
            );
        }

        return result[0];
    }
}

