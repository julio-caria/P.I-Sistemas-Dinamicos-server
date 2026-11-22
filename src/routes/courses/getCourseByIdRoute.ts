import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

import { db } from "../../database/client.ts";
import { courses } from "../../database/schema.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const getCourseByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/api/v1/courses/:courseId",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Courses"],
        summary: "Get Course By ID",
        description: "Retrieve a course by its unique identifier.",
        params: z.object({
          courseId: z.uuid(),
        }),
        response: {
          200: z.object({
            course: z.object({
              id: z.string(),
              name: z.string(),
              workloadHours: z.number(),
              durationSemesters: z.number(),
              modality: z.string(),
              isActive: z.boolean(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          }),
          401: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },

    async (request, reply) => {
      const user = getUserFromRequest(request);

      if (!user) {
        return reply.status(401).send({
          message: "Unauthorized access.",
        });
      }

      const { courseId } = request.params;

      try {
        const [course] = await db
          .select()
          .from(courses)
          .where(and(eq(courses.id, courseId), eq(courses.isActive, true)))
          .limit(1);

        if (!course) {
          return reply.status(404).send({
            message: "Course not found.",
          });
        }

        return reply.status(200).send({
          course,
        });
      } catch (error) {
        server.log.error({ error, courseId }, "Error while retrieving course.");

        return reply.status(500).send({
          message: "Internal server error.",
        });
      }
    },
  );
};
