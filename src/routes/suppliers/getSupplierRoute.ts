import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { checkRequestJWT } from "../hooks/check-request-jwt.ts"
import z from "zod"
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts"
import { suppliers } from "../../database/schema.ts"
import { db } from "../../database/client.ts"
import { eq } from "drizzle-orm"

export const getSupplierRoute: FastifyPluginAsyncZod = async (server) => {
  server.get("/api/v1/suppliers", { 
    preHandler: [checkRequestJWT],
    schema: { 
      tags: ["Suppliers"],
      summary: "Get all Suppliers info ",
      description: "Return all Suppliers registered on database, should be authenticated",
      response: { 
        200: z.object({
          suppliers: z.array(z.object({
            id: z.string().uuid(),
            legalName: z.string(),
            cnpj: z.string().max(18),
            stateRegistration: z.string().nullable(),
            email: z.email(),
            phone: z.string().max(20),
            address: z.string().max(255),
            category: z.string().max(100),
            createdAt: z.coerce.date(),
            updatedAt: z.coerce.date(),
          }))
        }),
        404: z.object({ 
          message: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
        500: z.object({ 
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => { 
    const user = getUserFromRequest(request);

    if(!user) { 
      return reply.status(401).send({ message: "You aren't authorized" })
    }

    try { 
      const result = await db
        .select({
          id: suppliers.id,
          legalName: suppliers.legalName,
          cnpj: suppliers.cnpj,
          stateRegistration: suppliers.stateRegistration,
          email: suppliers.email,
          phone: suppliers.phone,
          address: suppliers.address,
          category: suppliers.category,
          createdAt: suppliers.createdAt,
          updatedAt: suppliers.updatedAt,
        })
        .from(suppliers)
        .where(eq(suppliers.isActive, true));

        if(result.length === 0) { 
          return reply.status(404).send({ message: "No Suppliers found" })
        }
        return reply.status(200).send({ suppliers: result });
    } catch (err) { 
      request.log.error(err);
      return reply.status(500).send({ message: "Server internal error" });
    }
  })
}