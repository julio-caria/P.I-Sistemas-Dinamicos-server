import type { UserRole } from "../types/user.ts";

declare module "fastify" { 
  export interface FastifyRequest {
    user?: {
      sub: string,
      role: UserRole,
    }
  }
}