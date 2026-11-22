import {
  pgTable,
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
import { academicSemesterEnum, courseModalityEnum, degreeLevelEnum, enrollmentStatusEnum, genderEnum, studentStatusEnum, userRoleEnum, classStatusEnum } from './schema/enums.ts'

export const students = pgTable(
  "students",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull(),
    cpf: varchar("cpf", { length: 14 }).notNull(),
    email: varchar("email", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    secondaryPhone: varchar("secondary_phone", { length: 20 }),
    address: varchar("address", { length: 255 }).notNull(),
    registrationNumber: varchar("registration_number", {
      length: 20,
    }).notNull(),
    admissionDate: timestamp("admission_date").notNull(),
    birthDate: date("birth_date"),
    gender: genderEnum("gender"),
    nationality: varchar("nationality", { length: 80 }),
    naturalness: varchar("naturalness", { length: 120 }),
    photoUrl: varchar("photo_url", { length: 500 }),
    emergencyContact: varchar("emergency_contact", { length: 120 }),
    status: studentStatusEnum("status").default("active").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => ({
    cpfUq: uniqueIndex("students_cpf_uq").on(t.cpf),
    emailUq: uniqueIndex("students_email_uq").on(t.email),
    registrationNumberUq: uniqueIndex("students_registration_number_uq").on(
      t.registrationNumber,
    ),
  }),
);

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
    updatedAt:      timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    cpfUq:          uniqueIndex('teachers_cpf_uq').on(t.cpf),
    emailUq:        uniqueIndex('teachers_email_uq').on(t.email),
    employeeNumberUq: uniqueIndex('teachers_employee_number_uq').on(t.employeeNumber),
  }),
)

export const suppliers = pgTable(
  'suppliers',
  {
    id:               uuid('id').primaryKey().defaultRandom(),
    legalName:        varchar('legal_name', { length: 200 }).notNull(),
    cnpj:             varchar('cnpj', { length: 18 }).notNull(),
    stateRegistration:varchar('state_registration', { length: 30 }),
    email:            varchar('email', { length: 120 }).notNull(),
    phone:            varchar('phone', { length: 20 }).notNull(),
    address:          varchar('address', { length: 255 }).notNull(),
    category:         varchar('category', { length: 100 }).notNull(),
    isActive:          boolean('is_active').default(true).notNull(),
    createdAt:        timestamp('created_at').defaultNow().notNull(),
    updatedAt:        timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    cnpjUq: uniqueIndex('suppliers_cnpj_uq').on(t.cnpj),
  }),
)

export const courses = pgTable('courses', {
  id:               uuid('id').primaryKey().defaultRandom(),
  name:             varchar('name', { length: 150 }).notNull(),
  workloadHours:    integer('workload_hours').notNull(),
  durationSemesters: integer('duration_semesters').notNull(),
  modality:         courseModalityEnum('modality').default('in_person').notNull(),
  isActive:         boolean('is_active').default(true).notNull(),
  createdAt:        timestamp('created_at').defaultNow().notNull(),
  updatedAt:        timestamp('updated_at').defaultNow().notNull(),
});

export const classes = pgTable(
  "classes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    teacherId: uuid("teacher_id").references(() => teachers.id, {
      onDelete: "set null",
    }),
    description: varchar("description", { length: 200 }).notNull(),
    semester: academicSemesterEnum("semester").notNull(),
    year: integer("year").notNull(),
    scheduleTime: time("schedule_time").notNull(),
    room: varchar("room", { length: 50 }).notNull(),
    status: classStatusEnum("status").default("planned").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    idxCourse: index("classes_course_idx").on(t.courseId),
    idxTeacher: index("classes_teacher_idx").on(t.teacherId),
  }),
);

export const enrollments = pgTable(
  'enrollments',
  {
    studentId: uuid('student_id')
                .notNull()
                .references(() => students.id, { onDelete: 'cascade' }),
    classId:   uuid('class_id')
                .notNull()
                .references(() => classes.id, { onDelete: 'cascade' }),
    enrollmentDate:       date('enrollment_date').notNull(),
    finalGrade:           numeric('final_grade', { precision: 4, scale: 2 }),
    attendancePercentage: numeric('attendance_percentage', { precision: 5, scale: 2 }),
    status:               enrollmentStatusEnum('status').default('in_progress').notNull(),
    createdAt:            timestamp('created_at').defaultNow().notNull(),
    updatedAt:            timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    pk:        primaryKey({ columns: [t.studentId, t.classId] }),
    idxStudent: index('enrollments_student_idx').on(t.studentId),
    idxClass:   index('enrollments_class_idx').on(t.classId),
  }),
)

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("firstName", { length: 100 }).notNull(),
    lastName: varchar("lastName", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    personalEmail: varchar("personal_email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    mustChangePassword: boolean("must_change_password").default(true).notNull(),
    role: userRoleEnum("role").default("secretary").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_uq").on(t.email),
  }),
);

export const schema = {
  students,
  teachers,
  suppliers,
  courses,
  classes,
  enrollments,
  users,
} as const
