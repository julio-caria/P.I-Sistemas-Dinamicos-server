CREATE TYPE "public"."academic_semester" AS ENUM('1', '2');--> statement-breakpoint
CREATE TYPE "public"."class_status" AS ENUM('planned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."course_modality" AS ENUM('in_person', 'online', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."degree_level" AS ENUM('undergraduate', 'specialization', 'master', 'doctorate');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('in_progress', 'approved', 'failed', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'other', 'not_informed');--> statement-breakpoint
CREATE TYPE "public"."room_type" AS ENUM('classroom', 'laboratory', 'auditorium', 'library', 'other');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('active', 'on_leave', 'graduated', 'withdrawn', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."teacher_status" AS ENUM('active', 'on_leave', 'inactive', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'secretary', 'finance', 'coordination');--> statement-breakpoint
CREATE TYPE "public"."week_day" AS ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"teacher_id" uuid,
	"description" varchar(200) NOT NULL,
	"semester" "academic_semester" NOT NULL,
	"year" integer NOT NULL,
	"schedule_time" time NOT NULL,
	"room" varchar(50) NOT NULL,
	"status" "class_status" DEFAULT 'planned' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(150) NOT NULL,
	"workload_hours" integer NOT NULL,
	"duration_semesters" integer NOT NULL,
	"modality" "course_modality" DEFAULT 'in_person' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "enrollments" (
	"student_id" uuid NOT NULL,
	"class_id" uuid NOT NULL,
	"enrollment_date" date NOT NULL,
	"final_grade" numeric(4, 2),
	"attendance_percentage" numeric(5, 2),
	"status" "enrollment_status" DEFAULT 'in_progress' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "enrollments_student_id_class_id_pk" PRIMARY KEY("student_id","class_id")
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"email" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"secondary_phone" varchar(20),
	"address" varchar(255) NOT NULL,
	"registration_number" varchar(20) NOT NULL,
	"admission_date" timestamp NOT NULL,
	"birth_date" date,
	"gender" "gender",
	"nationality" varchar(80),
	"naturalness" varchar(120),
	"photo_url" varchar(500),
	"emergency_contact" varchar(120),
	"status" "student_status" DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"legal_name" varchar(200) NOT NULL,
	"cnpj" varchar(18) NOT NULL,
	"state_registration" varchar(30),
	"email" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(200) NOT NULL,
	"cpf" varchar(14) NOT NULL,
	"rg" varchar(20),
	"email" varchar(120) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"address" varchar(255) NOT NULL,
	"employee_number" varchar(20) NOT NULL,
	"degree_level" "degree_level" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firstName" varchar(100) NOT NULL,
	"lastName" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"personal_email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"role" "user_role" DEFAULT 'secretary' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "classes_course_idx" ON "classes" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "classes_teacher_idx" ON "classes" USING btree ("teacher_id");--> statement-breakpoint
CREATE INDEX "enrollments_student_idx" ON "enrollments" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "enrollments_class_idx" ON "enrollments" USING btree ("class_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_cpf_uq" ON "students" USING btree ("cpf");--> statement-breakpoint
CREATE UNIQUE INDEX "students_email_uq" ON "students" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "students_registration_number_uq" ON "students" USING btree ("registration_number");--> statement-breakpoint
CREATE UNIQUE INDEX "suppliers_cnpj_uq" ON "suppliers" USING btree ("cnpj");--> statement-breakpoint
CREATE UNIQUE INDEX "teachers_cpf_uq" ON "teachers" USING btree ("cpf");--> statement-breakpoint
CREATE UNIQUE INDEX "teachers_email_uq" ON "teachers" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "teachers_employee_number_uq" ON "teachers" USING btree ("employee_number");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uq" ON "users" USING btree ("email");