import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { db } from "../../database/client.ts";
import { teachers } from "../../database/schema.ts";
import { degreeLevelEnum } from "../../database/schema/enums.ts";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const createTeacherRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/api/v1/teachers",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Teachers"],
        summary: "Create Teacher",
        description:
          "Create a new teacher. CPF, email and employee number must be unique.",
        body: z.object({
          name: z.string().trim().min(1, "Name is required").max(200),
          cpf: z.string().trim().min(11, "Invalid CPF").max(14),
          rg: z.string().trim().max(20).nullable().optional(),
          email: z.string().trim().email("Invalid email").max(120),
          phone: z.string().trim().min(1, "Phone is required").max(20),
          address: z.string().trim().min(1, "Address is required").max(255),
          employeeNumber: z
            .string()
            .trim()
            .min(1, "Employee number is required")
            .max(20),
          degreeLevel: z.enum(degreeLevelEnum.enumValues),
          isActive: z.boolean().optional(),
        }),
        response: {
          201: z.object({ id: z.string().uuid(), message: z.string() }),
          401: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
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
          .insert(teachers)
          .values({ ...body, rg: body.rg ?? null })
          .returning({ id: teachers.id });

        return reply
          .status(201)
          .send({ id: created.id, message: "Teacher created" });
      } catch (err) {
        const pg = err as { code?: string; cause?: { code?: string } };
        const code = pg.code ?? pg.cause?.code;

        if (code === "23505") {
          return reply
            .status(409)
            .send({ message: "CPF, email or employee number already in use." });
        }
        request.log.error(err);
        return reply.status(500).send({ message: "Unable to create teacher." });
      }
    },
  );
};
