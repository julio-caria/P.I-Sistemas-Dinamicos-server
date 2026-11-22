import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import z from "zod";
import { suppliers } from "../../database/schema.ts";
import { db } from "../../database/client.ts";

export const createSupplierRoute: FastifyPluginAsyncZod = async (server) => {
  server.post(
    "/api/v1/suppliers",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Suppliers"],
        summary: "Create Supplier",
        description: "Create a supplier using legal Name, CNPJ, State Registration, Email, Phone, and another items, should be authenticated to use this resource",
        body: z.object({
          legalName: z.string().trim().min(2).max(200),
          cnpj: z.string().trim().min(14).max(18),
          stateRegistration: z.string().max(30).nullable().optional(),
          email: z.email(),
          phone: z.string().trim().min(8).max(20),
          address: z.string().trim().min(5).max(255),
          category: z.string().trim().min(2).max(100),
        }),
        response: {
          201: z.object({
            message: z.string(),
            supplierId: z.string().uuid(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = request.body

      try {
        const [supplier] = await db
          .insert(suppliers)
          .values(data)
          .returning()

        return reply.status(201).send({
          message: 'Fornecedor cadastrado com sucesso.',
          supplierId: supplier.id,
        })
      } catch (error) {
        request.log.error(error)
        return reply.status(500).send({
          message: 'Erro interno ao cadastrar fornecedor.',
        })
      }
    },
  );
}