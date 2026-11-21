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

export const degreeLevelEnum = pgEnum('degree_level', [
  'undergraduate',
  'specialization',
  'master',
  'doctorate',
])

export const courseModalityEnum = pgEnum('course_modality', [
  'in_person',
  'online',
  'hybrid',
])

export const academicSemesterEnum = pgEnum('academic_semester', ['1', '2'])

export const enrollmentStatusEnum = pgEnum('enrollment_status', [
  'in_progress',
  'approved',
  'failed',
  'withdrawn',
])

export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'secretary',
  'finance',
  'coordination',
])

export const students = pgTable(
  'students',
  {
    id:                 uuid('id').primaryKey().defaultRandom(),
    name:               varchar('name', { length: 200 }).notNull(),
    cpf:                varchar('cpf', { length: 14 }).notNull(),
    email:              varchar('email', { length: 120 }).notNull(),
    phone:              varchar('phone', { length: 20 }).notNull(),
    address:            varchar('address', { length: 255 }).notNull(),
    registrationNumber: varchar('registration_number', { length: 20 }).notNull(),
    admissionDate:      timestamp('admission_date').notNull(),
    isActive:           boolean('is_active').default(true).notNull(),
    createdAt:          timestamp('created_at').defaultNow().notNull(),
    updatedAt:          timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    cpfUq:                uniqueIndex('students_cpf_uq').on(t.cpf),
    emailUq:              uniqueIndex('students_email_uq').on(t.email),
    registrationNumberUq: uniqueIndex('students_registration_number_uq').on(t.registrationNumber),
  }),
)

export const teachers = pgTable(
  'teachers',
  {
    id:             uuid('id').primaryKey().defaultRandom(),
    name:           varchar('name', { length: 200 }).notNull(),
    cpf:            varchar('cpf', { length: 14 }).notNull(),
    rg:             varchar('rg', { length: 20 }),
    email:          varchar('email', { length: 120 }).notNull(),
    phone:          varchar('phone', { length: 20 }).notNull(),
    address:        varchar('address', { length: 255 }).notNull(),
    employeeNumber: varchar('employee_number', { length: 20 }).notNull(),
    degreeLevel:    degreeLevelEnum('degree_level').notNull(),
    isActive:       boolean('is_active').default(true).notNull(),
    createdAt:      timestamp('created_at').defaultNow().notNull(),
    updatedAt:      timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    cpfUq:            uniqueIndex('teachers_cpf_uq').on(t.cpf),
    emailUq:          uniqueIndex('teachers_email_uq').on(t.email),
    employeeNumberUq: uniqueIndex('teachers_employee_number_uq').on(t.employeeNumber),
  }),
)

export const suppliers = pgTable(
  'suppliers',
  {
    id:                uuid('id').primaryKey().defaultRandom(),
    legalName:         varchar('legal_name', { length: 200 }).notNull(),
    cnpj:              varchar('cnpj', { length: 18 }).notNull(),
    stateRegistration: varchar('state_registration', { length: 30 }),
    email:             varchar('email', { length: 120 }).notNull(),
    phone:             varchar('phone', { length: 20 }).notNull(),
    address:           varchar('address', { length: 255 }).notNull(),
    category:          varchar('category', { length: 100 }).notNull(),
    isActive:          boolean('is_active').default(true).notNull(),
    createdAt:         timestamp('created_at').defaultNow().notNull(),
    updatedAt:         timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    cnpjUq: uniqueIndex('suppliers_cnpj_uq').on(t.cnpj),
  }),
)

export const courses = pgTable(
  'courses',
  {
    id:                uuid('id').primaryKey().defaultRandom(),
    name:              varchar('name', { length: 150 }).notNull(),
    workloadHours:     integer('workload_hours').notNull(),
    durationSemesters: integer('duration_semesters').notNull(),
    modality:          courseModalityEnum('modality').default('in_person').notNull(),
    isActive:          boolean('is_active').default(true).notNull(),
    createdAt:         timestamp('created_at').defaultNow().notNull(),
    updatedAt:         timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    nameModalityUq: uniqueIndex('courses_name_modality_uq').on(t.name, t.modality),
  }),
)

export const classes = pgTable(
  'classes',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    courseId:     uuid('course_id')
                    .notNull()
                    .references(() => courses.id, { onDelete: 'restrict' }),
    teacherId:    uuid('teacher_id')
                    .references(() => teachers.id, { onDelete: 'set null' }),
    description:  varchar('description', { length: 200 }).notNull(),
    semester:     academicSemesterEnum('semester').notNull(),
    year:         integer('year').notNull(),
    scheduleTime: time('schedule_time').notNull(),
    room:         varchar('room', { length: 50 }).notNull(),
    createdAt:    timestamp('created_at').defaultNow().notNull(),
    updatedAt:    timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    idxCourse:      index('classes_course_idx').on(t.courseId),
    idxTeacher:     index('classes_teacher_idx').on(t.teacherId),
    roomScheduleUq: uniqueIndex('classes_room_schedule_uq').on(t.year, t.semester, t.room, t.scheduleTime),
  }),
)

export const enrollments = pgTable(
  'enrollments',
  {
    studentId:            uuid('student_id')
                            .notNull()
                            .references(() => students.id, { onDelete: 'cascade' }),
    classId:              uuid('class_id')
                            .notNull()
                            .references(() => classes.id, { onDelete: 'cascade' }),
    enrollmentDate:       date('enrollment_date').notNull(),
    finalGrade:           numeric('final_grade', { precision: 4, scale: 2 }),
    attendancePercentage: numeric('attendance_percentage', { precision: 5, scale: 2 }),
    status:               enrollmentStatusEnum('status').default('in_progress').notNull(),
    createdAt:            timestamp('created_at').defaultNow().notNull(),
    updatedAt:            timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    pk:         primaryKey({ columns: [t.studentId, t.classId] }),
    idxStudent: index('enrollments_student_idx').on(t.studentId),
    idxClass:   index('enrollments_class_idx').on(t.classId),
  }),
)

export const users = pgTable(
  'users',
  {
    id:                 uuid('id').primaryKey().defaultRandom(),
    firstName:          varchar('first_name', { length: 100 }).notNull(),
    lastName:           varchar('last_name', { length: 100 }).notNull(),
    email:              varchar('email', { length: 255 }).notNull(),
    personalEmail:      varchar('personal_email', { length: 255 }).notNull(),
    passwordHash:       varchar('password_hash', { length: 255 }).notNull(),
    mustChangePassword: boolean('must_change_password').default(true).notNull(),
    role:               userRoleEnum('role').default('secretary').notNull(),
    isActive:           boolean('is_active').default(true).notNull(),
    createdAt:          timestamp('created_at').defaultNow().notNull(),
    updatedAt:          timestamp('updated_at').defaultNow().$onUpdate(() => new Date()).notNull(),
  },
  (t) => ({
    emailUq: uniqueIndex('users_email_uq').on(t.email),
  }),
)

export const coursesRelations = relations(courses, ({ many }) => ({
  classes: many(classes),
}))

export const teachersRelations = relations(teachers, ({ many }) => ({
  classes: many(classes),
}))

export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments),
}))

export const classesRelations = relations(classes, ({ one, many }) => ({
  course:      one(courses, { fields: [classes.courseId], references: [courses.id] }),
  teacher:     one(teachers, { fields: [classes.teacherId], references: [teachers.id] }),
  enrollments: many(enrollments),
}))

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  class:   one(classes, { fields: [enrollments.classId], references: [classes.id] }),
}))

export const schema = {
  degreeLevelEnum,
  courseModalityEnum,
  academicSemesterEnum,
  enrollmentStatusEnum,
  userRoleEnum,

  students,
  teachers,
  suppliers,
  courses,
  classes,
  enrollments,
  users,

  coursesRelations,
  teachersRelations,
  studentsRelations,
  classesRelations,
  enrollmentsRelations,
} as const

export type Student = typeof students.$inferSelect
export type NewStudent = typeof students.$inferInsert

export type Teacher = typeof teachers.$inferSelect
export type NewTeacher = typeof teachers.$inferInsert

export type Supplier = typeof suppliers.$inferSelect
export type NewSupplier = typeof suppliers.$inferInsert

export type Course = typeof courses.$inferSelect
export type NewCourse = typeof courses.$inferInsert

export type Class = typeof classes.$inferSelect
export type NewClass = typeof classes.$inferInsert

export type Enrollment = typeof enrollments.$inferSelect
export type NewEnrollment = typeof enrollments.$inferInsert

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert