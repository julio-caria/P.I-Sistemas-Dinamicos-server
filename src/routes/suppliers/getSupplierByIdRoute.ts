import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { suppliers } from "../../database/schema.ts";
import { db } from "../../database/client.ts";


export const getSupplierByIdRoute: FastifyPluginAsyncZod = async (server) => {
  server.get(
    "/api/v1/suppliers/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Suppliers"],
        summary: "Get supplier by ID",
        description: "Returns a supplier by its UUID.",
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({
            supplier: z.object({
              id: z.string().uuid(),
              legalName: z.string(),
              cnpj: z.string().max(18),
              stateRegistration: z.string().nullable(),
              email: z.email(),
              phone: z.string().max(20),
              address: z.string().max(255),
              category: z.string().max(100),
              isActive: z.boolean(),
              createdAt: z.coerce.date(),
              updatedAt: z.coerce.date(),
            }),
          }),
          401: z.object({
            message: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },

    async (request, reply) => {
      const user = getUserFromRequest(request);

      if (!user) {
        return reply.status(401).send({
          message: "You aren't authorized.",
        });
      }

      try {
        const { id } = request.params;
        const [supplier] = await db
          .select({
            id: suppliers.id,
            legalName: suppliers.legalName,
            cnpj: suppliers.cnpj,
            stateRegistration: suppliers.stateRegistration,
            email: suppliers.email,
            phone: suppliers.phone,
            address: suppliers.address,
            category: suppliers.category,
            isActive: suppliers.isActive,
            createdAt: suppliers.createdAt,
            updatedAt: suppliers.updatedAt,
          })
          .from(suppliers)
          .where(eq(suppliers.id, id))
          .limit(1);

        if (!supplier) {
          return reply.status(404).send({
            message: "Supplier not found.",
          });
        }
        return reply.status(200).send({
          supplier,
        });
      } catch (err) {
        request.log.error(err);

        return reply.status(500).send({
          message: "Internal server error.",
        });
      }
    },
  );
};
