import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { z } from "zod";
import { courses } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { db } from "../../database/client.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const deleteCourseRoute: FastifyPluginAsyncZod = async (server) => { 
  server.delete(
    "/api/v1/courses/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Courses"],
        summary: "Delete Course",
        description: "Performs a logical deletion of a course.",
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            id: z.string().uuid(),
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

      const { id } = request.params;

      try {
        const [deletedCourse] = await db
          .update(courses)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(courses.id, id))
          .returning({
            id: courses.id,
          });

        if (!deletedCourse) {
          return reply.status(404).send({
            message: "Course not found.",
          });
        }

        return reply.status(200).send({
          message: "Course successfully deactivated.",
          id: deletedCourse.id,
        });
      } catch (error) {
        server.log.error(
          { error, id },
          "Error while deactivating course.",
        );

        return reply.status(500).send({
          message: "Internal server error.",
        });
      }
    },
  );
}