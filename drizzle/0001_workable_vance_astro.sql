ALTER TABLE "alunos" ALTER COLUMN "ativo" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "alunos" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "alunos" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "alunos" DROP COLUMN "rg";