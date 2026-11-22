import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { users } from "../../database/schema.ts";
import { eq } from "drizzle-orm";
import { db } from "../../database/client.ts";
import jwt from "jsonwebtoken";
import { verify } from "argon2";

export const loginRoute: FastifyPluginAsyncZod = async (server) => {
  server.post("/api/v1/login", {
    schema: { 
      tags: ["Authentication"],
      summary: "Login Route",
      description: "Use this resource to get Bearer Token and use on other routes, you need an email and password to proceed, valid with database",
      body: z.object({
        email: z.email("E-mail is required!"),
        password: z.string("Password is required"),
      }),
      response: {
        200: z.object({
          token: z.string(),
        }),
        201: z.object({
          token: z.string(),
        }),
        400: z.object({
          message: z.string(),
        }),
        401: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    try { 
      const { email, password } = request.body;
      
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if(result.length === 0) {
        return reply.status(400).send({ message: "Invalid Credentials"})
      }

      const user = result[0];

      const doesPasswordMatch = await verify(user.passwordHash, password);

      if(!doesPasswordMatch) { 
        return reply.status(400).send({ message: "Invalid password. Try Again"})
      }

      const token = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET!)

      return reply.status(200).send({ token })
    } catch(err) { 
      request.log.error(err);
      const detail =
        process.env.NODE_ENV === "production"
          ? ""
          : ` [${(err as { cause?: Error }).cause?.message ?? (err as Error).message}]`;
      return reply
        .status(500)
        .send({ message: `Unable to update student.${detail}` });
    }
  })
}