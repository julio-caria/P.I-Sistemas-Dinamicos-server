import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "../../database/client.ts";
import { classes } from "../../database/schema.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const deleteClassRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/api/v1/classes/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Classes"],
        summary: "Delete Class",
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
      
      if(!user) { 
        return reply.status(401).send({ message: "You aren't authorized" })
      }

      try {
        const deleted = await db
          .update(classes)
          .set({ isActive: false, updatedAt: new Date() })
          .where(and(eq(classes.id, id), eq(classes.isActive, true)))
          .returning({ id: classes.id });

        if (deleted.length === 0) {
          return reply
            .status(404)
            .send({ message: "Class not found, verify ID and try again" });
        }

        return reply.status(200).send({ message: "Class deleted" });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Unable to delete class." });
      }
    },
  );
};
