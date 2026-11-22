import { pgEnum } from "drizzle-orm/pg-core";

export const degreeLevelEnum = pgEnum("degree_level", [
  "undergraduate",
  "specialization",
  "master",
  "doctorate",
]);

export const courseModalityEnum = pgEnum("course_modality", [
  "in_person",
  "online",
  "hybrid",
]);

export const academicSemesterEnum = pgEnum("academic_semester", ["1", "2"]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "in_progress",
  "approved",
  "failed",
  "withdrawn",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "secretary",
  "finance",
  "coordination",
]);

export const studentStatusEnum = pgEnum("student_status", [
  "active",
  "on_leave",
  "graduated",
  "withdrawn",
  "dismissed",
]);

export const genderEnum = pgEnum("gender", [
  "male",
  "female",
  "other",
  "not_informed",
]);

export const teacherStatusEnum = pgEnum("teacher_status", [
  "active",
  "on_leave",
  "inactive",
  "terminated",
]);

export const weekDayEnum = pgEnum("week_day", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const roomTypeEnum = pgEnum("room_type", [
  "classroom",
  "laboratory",
  "auditorium",
  "library",
  "other",
]);

export const classStatusEnum = pgEnum("class_status", [
  "planned",
  "in_progress",
  "completed",
  "cancelled",
]);