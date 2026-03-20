// Types for Clinical Alerts

export interface ClinicalAlert {
    idAlert: string;
    dataAlert: Date | string;
    stato: boolean;
    descrizione?: string;
}

export interface LoadingState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}
