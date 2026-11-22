import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../database/client.ts";
import { classes } from "../../database/schema.ts";
import {
  academicSemesterEnum,
  classStatusEnum,
} from "../../database/schema/enums.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const createClassRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/api/v1/classes",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Classes"],
        summary: "Create Class",
        description:
          "Create a class linked to an existing course and (optionally) a teacher.",
        body: z.object({
          courseId: z.string().uuid(),
          teacherId: z.string().uuid().nullable().optional(),
          description: z
            .string()
            .trim()
            .min(1, "Description is required")
            .max(200),
          semester: z.enum(academicSemesterEnum.enumValues),
          year: z.number().int().min(2000).max(2100),
          scheduleTime: z
            .string()
            .regex(
              /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
              "Use HH:MM or HH:MM:SS",
            ),
          room: z.string().trim().min(1, "Room is required").max(50),
          status: z.enum(classStatusEnum.enumValues).optional(),
          isActive: z.boolean().optional(),
        }),
        response: {
          201: z.object({ id: z.string().uuid(), message: z.string() }),
          400: z.object({ message: z.string() }),
          401: z.object({ message: z.string(), }),
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
        const body = request.body;

        const [created] = await db
          .insert(classes)
          .values({ ...body, teacherId: body.teacherId ?? null })
          .returning({ id: classes.id });

        return reply
          .status(201)
          .send({ id: created.id, message: "Class created" });
      } catch (err) {
        const pg = err as { code?: string; cause?: { code?: string } };
        const code = pg.code ?? pg.cause?.code;

        if (code === "23503") {
          return reply
            .status(400)
            .send({ message: "Invalid courseId or teacherId." });
        }
        request.log.error(err);
        return reply.status(500).send({ message: "Unable to create class." });
      }
    },
  );
};
