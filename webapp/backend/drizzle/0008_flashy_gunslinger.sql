CREATE TYPE "public"."tipologia_notifica" AS ENUM('Promemoria', 'Motivazionale', 'Informativa', 'Questionario', 'SUPPORTO', 'INVALIDAZIONE');--> statement-breakpoint
ALTER TABLE "notifica" ALTER COLUMN "tipologia" SET DATA TYPE "public"."tipologia_notifica" USING "tipologia"::"public"."tipologia_notifica";--> statement-breakpoint
ALTER TABLE "paziente" ADD COLUMN "strategia_attuale" jsonb;--> statement-breakpoint
ALTER TABLE "paziente" ADD COLUMN "data_aggiornamento_strategia" timestamp;