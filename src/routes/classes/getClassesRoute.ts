import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { asc, desc } from "drizzle-orm";
import { db } from "../../database/client.ts";
import { classes } from "../../database/schema.ts";
import {
  academicSemesterEnum,
  classStatusEnum,
} from "../../database/schema/enums.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const getClassesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/api/v1/classes",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Classes"],
        summary: "Get Classes",
        description: "List all classes.",
        response: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              courseId: z.string().uuid(),
              teacherId: z.string().uuid().nullable(),
              description: z.string(),
              semester: z.enum(academicSemesterEnum.enumValues),
              year: z.number(),
              scheduleTime: z.string(),
              room: z.string(),
              status: z.enum(classStatusEnum.enumValues),
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
      
      if(!user) { 
        return reply.status(401).send({ message: "You aren't authorized" })
      }

      try {
        const result = await db
          .select()
          .from(classes)
          .orderBy(
            desc(classes.year),
            asc(classes.semester),
            asc(classes.description),
          );

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
          message: "Unable to retrieve classes. Internal server error.",
        });
      }
    },
  );
};
