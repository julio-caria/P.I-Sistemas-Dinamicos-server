import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { buildApp } from "../../../src/app.ts";
import { db } from "../../../src/database/client.ts";
import { courses } from "../../../src/database/schema.ts";

describe("POST /api/v1/courses", () => {
  let app: FastifyInstance;
  let createdCourseId: string | null = null;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterEach(async () => {
    if (createdCourseId) {
      await db.delete(courses).where(eq(courses.id, createdCourseId));
      createdCourseId = null;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it("should create a valid course and return 201 with courseId", async () => {
    const payload = {
      name: "Tecnologia em Sistemas para Internet - Teste",
      workload: 2000,
      semesters: 5,
      modality: "online",
      active: true,
    };

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/courses",
      payload,
    });

    const body = response.json();
    createdCourseId = body.courseId;

    expect(response.statusCode).toBe(201);
    expect(body).toHaveProperty("courseId");
    expect(typeof body.courseId).toBe("string");

    const [savedCourse] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, body.courseId));

    expect(savedCourse).toBeDefined();
    expect(savedCourse.name).toBe(payload.name);
    expect(savedCourse.workloadHours).toBe(2000);
    expect(savedCourse.durationSemesters).toBe(5);
    expect(savedCourse.modality).toBe("online");
  });

  it("should return 400 when request body fails Zod validation", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/courses",
      payload: {
        name: "",
        workload: 0,
        semesters: -1,
        modality: "invalid_modality",
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it("should return 409 when creating a duplicate course in the same modality", async () => {
    const [existing] = await db
      .insert(courses)
      .values({
        name: "Engenharia de Software - Duplicado",
        workloadHours: 3200,
        durationSemesters: 8,
        modality: "in_person",
      })
      .returning();

    createdCourseId = existing.id;

    const response = await app.inject({
      method: "POST",
      url: "/api/v1/courses",
      payload: {
        name: "Engenharia de Software - Duplicado",
        workload: 3200,
        semesters: 8,
        modality: "in_person",
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      message: "Course with this name and modality already exists",
    });
  });
});