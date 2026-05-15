import type { FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import type { JWTPayload } from "../../types/user.ts";

export async function checkRequestJWT(request: FastifyRequest, reply: FastifyReply) {
  const token = request.headers.authorization;

  if(!token) {
    return reply.status(401).send("You aren't authorized to use this resource");
  }

  if(!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be exist on .env");
  }

  try { 
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    request.user = payload;
  } catch (err) {
    return reply.status(401).send({ error: err })
  }

}