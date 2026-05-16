import { alunos } from './../database/schema.ts';
import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getUserFromRequest } from "../utils/getUserFromRequest.ts";
import { checkRequestJWT } from "./hooks/check-request-jwt.ts";
import { z } from "zod";
import { db } from "../database/client.ts";

export const getStudentsRoute: FastifyPluginAsyncZod = async (server) => {
  server.get("/api/students", { 
    preHandler: [
      checkRequestJWT,
    ],
    schema: {
      tags: ["Students"],
      description: "Return all students registered on system",
      summary: "",
      querystring: z.object({
        search: z.string().optional(),
        orderBy: z.enum(['ra', 'nome', 'cpf'])
      }),
      response: {
        200: z.object({
          students: z.array(z.object({
            id: z.uuid(),
            nome: z.string(),
            cpf: z.string(),
            email: z.email(),
            telefone: z.string(),
            endereco: z.string(),
            ra: z.string(),
            dataIngresso: z.coerce.date(),
            ativo: z.boolean().optional(),
          }))
        }),
        401: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    try { 
      const user = getUserFromRequest(request);

      if(!user) {
        return reply.status(401).send({ message: "You are'n authorized to use this resource"})
      }

      const result = await db
        .select()
        .from(alunos)

      return reply.status(200).send({ students: result });
    } catch (error) { 
      throw new Error("Não foi possível retornar a consulta.");
    }
  })
}