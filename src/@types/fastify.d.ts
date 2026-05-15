import type { JWTPayload } from "../types/user.ts";

declare module "fastify" {
  export interface FastifyRequest {
    user?: JWTPayload;
  }
}
