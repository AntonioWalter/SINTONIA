/**
 * Service per recuperare i dati dell'area personale del paziente
 * Endpoint: GET /paziente/area-personale
 */

import { API_URL as BASE_API_URL } from '../config';
import type { ProfileDto } from '../types/profile';

const API_URL = `${BASE_API_URL}/paziente/area-personale`;

/**
 * Recupera tutti i dati dell'area personale del paziente autenticato
 * Richiede token JWT salvato in localStorage
 * 
 * @returns ProfileDto con profilo, badge, stato d'animo, diario, questionari
 * @throws Error se il token è mancante o la richiesta fallisce
 */
export const getProfileData = async (): Promise<ProfileDto> => {
    try {
        const token = localStorage.getItem('patient_token');
        if (!token) {
            window.location.href = '/spid-info';
            throw new Error('Missing auth token. Redirecting to login...');
        }

        const response = await fetch(API_URL, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('patient_token');
            window.location.href = '/spid-info';
            throw new Error('Unauthorized. Redirecting to login...');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
    }
};
