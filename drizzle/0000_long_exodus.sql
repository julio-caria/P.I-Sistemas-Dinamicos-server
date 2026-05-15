CREATE TYPE "public"."modalidade_curso" AS ENUM('presencial', 'ead', 'hibrido');--> statement-breakpoint
CREATE TYPE "public"."papel_usuario" AS ENUM('admin', 'secretaria', 'financeiro', 'coordenacao');--> statement-breakpoint
CREATE TYPE "public"."resultado_matricula" AS ENUM('em_curso', 'aprovado', 'reprovado', 'trancado');--> statement-breakpoint
CREATE TYPE "public"."semestre_letivo" AS ENUM('1', '2');--> statement-breakpoint
CREATE TYPE "public"."titulacao" AS ENUM('graduacao', 'especializacao', 'mestre', 'doutor');--> statement-breakpoint
CREATE TABLE "alunos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(200) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"email" varchar(120) NOT NULL,
	"telefone" varchar(20) NOT NULL,
	"endereco" varchar(255) NOT NULL,
	"ra" varchar(20) NOT NULL,
	"data_ingresso" date NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cursos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(150) NOT NULL,
	"carga_horaria" integer NOT NULL,
	"duracao_semestres" integer NOT NULL,
	"modalidade" "modalidade_curso" DEFAULT 'presencial' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "docentes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(200) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"email" varchar(120) NOT NULL,
	"telefone" varchar(20) NOT NULL,
	"endereco" varchar(255) NOT NULL,
	"matricula_funcional" varchar(20) NOT NULL,
	"titulacao" "titulacao" NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fornecedores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"razao_social" varchar(200) NOT NULL,
	"cnpj" varchar(18) NOT NULL,
	"inscricao_estadual" varchar(30),
	"email" varchar(120) NOT NULL,
	"telefone" varchar(20) NOT NULL,
	"endereco" varchar(255) NOT NULL,
	"categoria" varchar(100) NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "matriculas" (
	"aluno_id" uuid NOT NULL,
	"turma_id" uuid NOT NULL,
	"data_matricula" date NOT NULL,
	"nota_final" numeric(4, 2),
	"frequencia_pct" numeric(5, 2),
	"resultado" "resultado_matricula" DEFAULT 'em_curso' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "matriculas_aluno_id_turma_id_pk" PRIMARY KEY("aluno_id","turma_id")
);
--> statement-breakpoint
CREATE TABLE "turmas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"curso_id" uuid NOT NULL,
	"docente_id" uuid,
	"descricao" varchar(200) NOT NULL,
	"semestre" "semestre_letivo" NOT NULL,
	"ano" integer NOT NULL,
	"horario" time NOT NULL,
	"sala" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(200) NOT NULL,
	"email" varchar(120) NOT NULL,
	"senha_hash" varchar(255) NOT NULL,
	"papel" "papel_usuario" DEFAULT 'secretaria' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_aluno_id_alunos_id_fk" FOREIGN KEY ("aluno_id") REFERENCES "public"."alunos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matriculas" ADD CONSTRAINT "matriculas_turma_id_turmas_id_fk" FOREIGN KEY ("turma_id") REFERENCES "public"."turmas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_curso_id_cursos_id_fk" FOREIGN KEY ("curso_id") REFERENCES "public"."cursos"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "turmas" ADD CONSTRAINT "turmas_docente_id_docentes_id_fk" FOREIGN KEY ("docente_id") REFERENCES "public"."docentes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "alunos_cpf_uq" ON "alunos" USING btree ("cpf");--> statement-breakpoint
CREATE UNIQUE INDEX "alunos_email_uq" ON "alunos" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "alunos_ra_uq" ON "alunos" USING btree ("ra");--> statement-breakpoint
CREATE UNIQUE INDEX "docentes_cpf_uq" ON "docentes" USING btree ("cpf");--> statement-breakpoint
CREATE UNIQUE INDEX "docentes_email_uq" ON "docentes" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "docentes_matricula_uq" ON "docentes" USING btree ("matricula_funcional");--> statement-breakpoint
CREATE UNIQUE INDEX "fornecedores_cnpj_uq" ON "fornecedores" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "matriculas_aluno_idx" ON "matriculas" USING btree ("aluno_id");--> statement-breakpoint
CREATE INDEX "matriculas_turma_idx" ON "matriculas" USING btree ("turma_id");--> statement-breakpoint
CREATE INDEX "turmas_curso_idx" ON "turmas" USING btree ("curso_id");--> statement-breakpoint
CREATE INDEX "turmas_docente_idx" ON "turmas" USING btree ("docente_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_uq" ON "usuarios" USING btree ("email");