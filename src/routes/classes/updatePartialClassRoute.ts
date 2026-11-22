import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "../../database/client.ts";
import { classes } from "../../database/schema.ts";
import {
  academicSemesterEnum,
  classStatusEnum,
} from "../../database/schema/enums.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const updatePartialClassRoute: FastifyPluginAsyncZod = async (server) => {
  server.patch(
    "/api/v1/classes/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Classes"],
        summary: "Update Class (partial)",
        description:
          "Partial update. Send teacherId: null to unassign the teacher.",
        params: z.object({ id: z.string().uuid() }),
        body: z
          .object({
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
          })
          .partial()
          .refine((b) => Object.keys(b).length > 0, {
            message: "Send at least one field to update",
          }),
        response: {
          200: z.object({ message: z.string() }),
          401: z.object({ message: z.string() }),
          404: z.object({ message: z.string() }),
          400: z.object({ message: z.string() }),
          500: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const body = request.body;
      const user = getUserFromRequest(request);
      
      if(!user) { 
        return reply.status(401).send({ message: "You aren't authorized" })
      }

      try {
        const updated = await db
          .update(classes)
          .set({ ...body, updatedAt: new Date() })
          .where(eq(classes.id, id))
          .returning({ id: classes.id });

        if (updated.length === 0) {
          return reply
            .status(404)
            .send({ message: "Class not found, verify ID and try again" });
        }

        return reply.status(200).send({ message: "Class updated" });
      } catch (err) {
        const pg = err as { code?: string; cause?: { code?: string } };
        const code = pg.code ?? pg.cause?.code;

        if (code === "23503") {
          return reply
            .status(400)
            .send({ message: "Invalid courseId or teacherId." });
        }
        request.log.error(err);
        return reply.status(500).send({ message: "Unable to update class." });
      }
    },
  );
};
