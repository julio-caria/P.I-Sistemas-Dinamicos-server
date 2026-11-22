import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { suppliers } from "../../database/schema.ts";
import { db } from "../../database/client.ts";

export const deleteSupplierRoute: FastifyPluginAsyncZod = async (server) => {
  server.delete(
    "/api/v1/suppliers/:id",
    {
      preHandler: [checkRequestJWT],
      schema: {
        tags: ["Suppliers"],
        summary: "Delete supplier",
        description:
          "Deactivates a supplier without permanently deleting its data.",
        params: z.object({
          id: z.string().uuid(),
        }),
        response: {
          200: z.object({ 
            message: z.string(),
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
          .update(suppliers)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(and(eq(suppliers.id, id), eq(suppliers.isActive, true)))
          .returning({
            id: suppliers.id,
          });

        if (!supplier) {
          return reply.status(404).send({
            message: "Supplier not found or already deactivated.",
          });
        }

        return reply.status(200).send({ message: "Supplier has been deactivated" });
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({
          message: "Internal server error.",
        });
      }
    },
  );
};
