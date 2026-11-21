import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { courses } from "../../database/schema.ts";
import { db } from "../../database/client.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";

function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const errorObj = err as Record<string, unknown>;
  const cause = errorObj.cause as Record<string, unknown> | undefined;
  return errorObj.code === "23505" || cause?.code === "23505";
}

export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/api/v1/courses",
    {
      schema: {
        tags: ["Courses"],
        summary: "Register a new course",
        description: "Register a course in database",
        body: z.object({
          name: z.string().min(1, "Course name is required"),
          workload: z.number().int().min(1, "Workload is required"),
          semesters: z.number().int().min(1, "Number of semesters required"),
          modality: z.enum(["in_person", "online", "hybrid"]),
          active: z.boolean().optional(),
        }),
        response: {
          201: z.object({
            courseId: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      try {
        const { name, workload, semesters, modality, active } = request.body;

        const result = await db
          .insert(courses)
          .values({
            name,
            workloadHours: workload,
            durationSemesters: semesters,
            modality,
            isActive: active,
          })
          .returning();

        return reply.status(201).send({ courseId: result[0].id });
      } catch (err) {
        if (isUniqueViolation(err)) {
          return reply.status(409).send({
            message: "Course with this name and modality already exists",
          });
        }
        throw err;
      }
    }
  );
};
