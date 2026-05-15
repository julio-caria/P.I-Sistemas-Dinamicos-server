import { db } from './../database/client.ts';
import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { eq } from 'drizzle-orm';
import { usuarios } from '../database/schema.ts';
import { hash } from 'argon2';

export const registerRoute: FastifyPluginAsyncZod = async (server) => { 
  server.post("/api/users", {
    schema: {
      tags: ["Authentication"],
      description: "Register an user with email, username and password", 
      summary: "",
      body: z.object({
        name: z.string().min(1, "Name is required"),
        email: z.email().min(1, "Email is required"),
        password: z.string().min(8, "Minimum 8 caracters is required to password"),
      }),
      response: {
        201: z.object({
          userId: z.string(),
        }),
        409: z.object({
          message: z.string(),
        }),
        500: z.object({
          message: z.string(),
        })
      },
    }
  }, async (request, reply) => {
    try {
      const { name, email, password } = request.body;
      
      const emailExist = await db
        .select()
        .from(usuarios)
        .where(eq(usuarios.email, email))
      
      if(emailExist.length > 0) {
        return reply.status(409).send({ message: "Credentials is already been used!" });
      }
      
      const passwordHash = await hash(password);
      
      const result = await db
        .insert(usuarios)
        .values({
          nome: name,
          email,
          senhaHash: passwordHash,
        })
        .returning()
      
      return reply.status(201).send({ userId: result[0].id})
    } catch (err) {
      console.error("Registration error:", err);
      return reply.status(500).send({ message: "Cannot process user registration" })    
    }
  })
}