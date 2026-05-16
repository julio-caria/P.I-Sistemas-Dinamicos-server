import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  integer,
  boolean,
  date,
  time,
  numeric,
  timestamp,
  primaryKey,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const titulacaoEnum = pgEnum('titulacao', [
  'graduacao',
  'especializacao',
  'mestre',
  'doutor',
])

export const modalidadeCursoEnum = pgEnum('modalidade_curso', [
  'presencial',
  'ead',
  'hibrido',
])

export const semestreLetivoEnum = pgEnum('semestre_letivo', ['1', '2'])

export const resultadoMatriculaEnum = pgEnum('resultado_matricula', [
  'em_curso',
  'aprovado',
  'reprovado',
  'trancado',
])

export const papelUsuarioEnum = pgEnum('papel_usuario', [
  'admin',
  'secretaria',
  'financeiro',
  'coordenacao',
])

export const alunos = pgTable(
  'alunos',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    nome:         varchar('nome', { length: 200 }).notNull(),
    cpf:          varchar('cpf', { length: 14 }).notNull(),
    email:        varchar('email', { length: 120 }).notNull(),
    telefone:     varchar('telefone', { length: 20 }).notNull(),
    endereco:     varchar('endereco', { length: 255 }).notNull(),
    ra:           varchar('ra', { length: 20 }).notNull(),
    dataIngresso: timestamp('data_ingresso').notNull(),
    ativo:        boolean('ativo').default(true).notNull(),
    createdAt:    timestamp('created_at').defaultNow(),
    updatedAt:    timestamp('updated_at').defaultNow(),
  },
  (t) => ({
    cpfUq:   uniqueIndex('alunos_cpf_uq').on(t.cpf),
    emailUq: uniqueIndex('alunos_email_uq').on(t.email),
    raUq:    uniqueIndex('alunos_ra_uq').on(t.ra),
  }),
)

export const docentes = pgTable(
  'docentes',
  {
    id:                 uuid('id').primaryKey().defaultRandom(),
    nome:               varchar('nome', { length: 200 }).notNull(),
    cpf:                varchar('cpf', { length: 14 }).notNull(),
    rg:                 varchar('rg', { length: 20 }),
    email:              varchar('email', { length: 120 }).notNull(),
    telefone:           varchar('telefone', { length: 20 }).notNull(),
    endereco:           varchar('endereco', { length: 255 }).notNull(),
    matriculaFuncional: varchar('matricula_funcional', { length: 20 }).notNull(),
    titulacao:          titulacaoEnum('titulacao').notNull(),
    ativo:              boolean('ativo').default(true).notNull(),
    createdAt:          timestamp('created_at').defaultNow().notNull(),
    updatedAt:          timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    cpfUq:       uniqueIndex('docentes_cpf_uq').on(t.cpf),
    emailUq:     uniqueIndex('docentes_email_uq').on(t.email),
    matriculaUq: uniqueIndex('docentes_matricula_uq').on(t.matriculaFuncional),
  }),
)

export const fornecedores = pgTable(
  'fornecedores',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    razaoSocial:      varchar('razao_social', { length: 200 }).notNull(),
    cnpj:             varchar('cnpj', { length: 18 }).notNull(),
    inscricaoEstadual:varchar('inscricao_estadual', { length: 30 }),
    email:            varchar('email', { length: 120 }).notNull(),
    telefone:         varchar('telefone', { length: 20 }).notNull(),
    endereco:         varchar('endereco', { length: 255 }).notNull(),
    categoria:        varchar('categoria', { length: 100 }).notNull(),
    ativo:            boolean('ativo').default(true).notNull(),
    createdAt:        timestamp('created_at').defaultNow().notNull(),
    updatedAt:        timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    cnpjUq: uniqueIndex('fornecedores_cnpj_uq').on(t.cnpj),
  }),
)

export const cursos = pgTable('cursos', {
  id:               uuid('id').primaryKey().defaultRandom(),
  nome:             varchar('nome', { length: 150 }).notNull(),
  cargaHoraria:     integer('carga_horaria').notNull(),     // horas-aula totais
  duracaoSemestres: integer('duracao_semestres').notNull(), // ex: 8
  modalidade:       modalidadeCursoEnum('modalidade').default('presencial').notNull(),
  ativo:            boolean('ativo').default(true).notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
})

export const turmas = pgTable(
  'turmas',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    cursoId:   uuid('curso_id')
                 .notNull()
                 .references(() => cursos.id, { onDelete: 'restrict' }),
    docenteId: uuid('docente_id')
                 .references(() => docentes.id, { onDelete: 'set null' }), // nullable: pode ser atribuído depois
    descricao: varchar('descricao', { length: 200 }).notNull(),
    semestre:  semestreLetivoEnum('semestre').notNull(),
    ano:       integer('ano').notNull(),
    horario:   time('horario').notNull(),
    sala:      varchar('sala', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    idxCurso:   index('turmas_curso_idx').on(t.cursoId),
    idxDocente: index('turmas_docente_idx').on(t.docenteId),
  }),
)

export const matriculas = pgTable(
  'matriculas',
  {
    alunoId:       uuid('aluno_id')
                     .notNull()
                     .references(() => alunos.id, { onDelete: 'cascade' }),
    turmaId:       uuid('turma_id')
                     .notNull()
                     .references(() => turmas.id, { onDelete: 'cascade' }),
    dataMatricula: date('data_matricula').notNull(),
    notaFinal:     numeric('nota_final', { precision: 4, scale: 2 }),     // 0.00–10.00
    frequenciaPct: numeric('frequencia_pct', { precision: 5, scale: 2 }), // 0.00–100.00
    resultado:     resultadoMatriculaEnum('resultado').default('em_curso').notNull(),
    createdAt:     timestamp('created_at').defaultNow().notNull(),
    updatedAt:     timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    pk:       primaryKey({ columns: [t.alunoId, t.turmaId] }),
    idxAluno: index('matriculas_aluno_idx').on(t.alunoId),
    idxTurma: index('matriculas_turma_idx').on(t.turmaId),
  }),
)

export const usuarios = pgTable(
  'usuarios',
  {
    id:        uuid('id').primaryKey().defaultRandom(),
    nome:      varchar('nome', { length: 200 }).notNull(),
    email:     varchar('email', { length: 120 }).notNull(),
    senhaHash: varchar('senha_hash', { length: 255 }).notNull(),
    papel:     papelUsuarioEnum('papel').default('secretaria').notNull(),
    ativo:     boolean('ativo').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    emailUq: uniqueIndex('usuarios_email_uq').on(t.email),
  }),
)

export const cursosRelations = relations(cursos, ({ many }) => ({
  turmas: many(turmas),
}))

export const docentesRelations = relations(docentes, ({ many }) => ({
  turmas: many(turmas),
}))

export const alunosRelations = relations(alunos, ({ many }) => ({
  matriculas: many(matriculas),
}))

export const turmasRelations = relations(turmas, ({ one, many }) => ({
  curso:      one(cursos,   { fields: [turmas.cursoId],   references: [cursos.id] }),
  docente:    one(docentes, { fields: [turmas.docenteId], references: [docentes.id] }),
  matriculas: many(matriculas),
}))

export const matriculasRelations = relations(matriculas, ({ one }) => ({
  aluno: one(alunos, { fields: [matriculas.alunoId], references: [alunos.id] }),
  turma: one(turmas, { fields: [matriculas.turmaId], references: [turmas.id] }),
}))

export const schema = {

  titulacaoEnum,
  modalidadeCursoEnum,
  semestreLetivoEnum,
  resultadoMatriculaEnum,
  papelUsuarioEnum,

  alunos,
  docentes,
  fornecedores,
  cursos,
  turmas,
  matriculas,
  usuarios,

  cursosRelations,
  docentesRelations,
  alunosRelations,
  turmasRelations,
  matriculasRelations,
} as const
