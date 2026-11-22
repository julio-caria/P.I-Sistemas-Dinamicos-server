import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../../database/client.ts";
import { teachers } from "../../database/schema.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const deleteTeacherRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/api/v1/teachers/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Teachers"],
        summary: "Delete Teacher",
        description: "Logical deletion: sets isActive to false.",
        params: z.object({ id: z.string().uuid() }),
        response: {
          200: z.object({ message: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = getUserFromRequest(request);

      if (!user) {
        return reply.status(401).send({ message: "You aren't authorized" });
      }

      try {
        const deleted = await db
          .update(teachers)
          .set({ isActive: false, updatedAt: new Date() })
          .where(and(eq(teachers.id, id), eq(teachers.isActive, true)))
          .returning({ id: teachers.id });

        if (deleted.length === 0) {
          return reply
            .status(404)
            .send({ message: "Teacher not found, verify ID and try again" });
        }

        return reply.status(200).send({ message: "Teacher deleted" });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Unable to delete teacher." });
      }
    },
  );
};
