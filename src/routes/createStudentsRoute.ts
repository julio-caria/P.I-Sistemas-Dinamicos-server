import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import z from "zod";
import { getUserFromRequest } from "../utils/getUserFromRequest.ts";
import { db } from "../database/client.ts";
import { alunos } from "../database/schema.ts";

export const createStudentRoute: FastifyPluginAsyncZod = async (server) => {
  server.post("/api/students", { 
    preHandler: [
      checkRequestJWT,
    ],
    schema: {
      tags: ["Student"],
      description: "Create an enrollment to student",
      summary: "",
      response: {
        201: z.object({
          studentId: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
      body: z.object({
        nome: z.string(),
        cpf: z.string(),
        email: z.email(),
        telefone: z.string(),
        endereco: z.string(),
        ra: z.string(),
        dataIngresso: z.coerce.date(),
      })
      
    }
  }, async (request, reply) => {
    const user = getUserFromRequest(request);
    const { nome, cpf, email, telefone, endereco, ra, dataIngresso } = request.body;

    if(!user) {
      return reply.status(401).send({ message: "You are'n authorized to use this resource"})
    }

    const result = await db
      .insert(alunos)
      .values({
        nome,
        cpf,
        email,
        telefone,
        endereco,
        ra,
        dataIngresso
      })
      .returning();

    return reply.send({ studentId: result[0].id });
  })
}