import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { courses } from "../../database/schema.ts";
import { db } from "../../database/client.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/api/v1/courses",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Courses"],
        summary: "Create course",
        description:
          "Register a course in database using name, workloadHours, duration semesters, modality (ead, in person or hybrid",
        body: z.object({
          name: z.string().min(1, "Course name is required"),
          workloadHours: z.number().min(1, "Workload is required"),
          durationSemesters: z.number().min(1, "Number of semesters required"),
          modality: z.enum(["in_person", "online", "hybrid"]),
          isActive: z.boolean().optional().default(true),
        }),
        response: {
          201: z.object({
            id: z.string(),
          }),
          401: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          })
        },
      },
    },
    async (request, reply) => {
      const user = getUserFromRequest(request);

      if(!user) { 
        return reply.status(401).send({ message: "You aren't authorized" })
      }

      try {
        const { name, workloadHours, durationSemesters, modality, isActive } =
          request.body;

        const [result] = await db
          .insert(courses)
          .values({
            name,
            workloadHours,
            durationSemesters,
            modality,
            isActive,
          })
          .returning();

        return reply.status(201).send({ id: result.id });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: `Couldn't complete this request, ${err}`})
      }
    },
  );
}