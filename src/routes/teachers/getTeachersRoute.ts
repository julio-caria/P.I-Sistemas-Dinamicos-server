import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { asc } from "drizzle-orm";
import { db } from "../../database/client.ts";
import { teachers } from "../../database/schema.ts";
import { degreeLevelEnum } from "../../database/schema/enums.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const getTeachersRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/api/v1/teachers",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Teachers"],
        summary: "Get Teachers",
        description: "List all teachers.",
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              cpf: z.string(),
              rg: z.string().nullable(),
              email: z.string(),
              phone: z.string(),
              address: z.string(),
              employeeNumber: z.string(),
              degreeLevel: z.enum(degreeLevelEnum.enumValues),
              isActive: z.boolean(),
              createdAt: z.string(),
              updatedAt: z.string(),
            }),
          ),
          401: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const user = getUserFromRequest(request);
      
      if (!user) {
        return reply.status(401).send({ message: "You aren't authorized" });
      }

      try {
        const result = await db
          .select()
          .from(teachers)
          .orderBy(asc(teachers.name));

        return reply.status(200).send(
          result.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
            updatedAt: item.updatedAt.toISOString(),
          })),
        );
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({
          message: "Unable to retrieve teachers. Internal server error.",
        });
      }
    },
  );
};
