import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { checkRequestJWT } from "../hooks/check-request-jwt.ts";
import z from "zod";
import { courses } from "../../database/schema.ts";
import { db } from "../../database/client.ts";
import { getUserFromRequest } from "../../utils/getUserFromRequest.ts";

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get("/api/v1/courses", {
    preHandler: [
      checkRequestJWT,
    ],
    schema: { 
      tags: ["Courses"],
      summary: "Get all Courses",
      description:"Return info of all courses registered on database, including name, workload, semesters and modality, you need provide a token to be use this resource",
      response: {
        200: z.object({
          courses: z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                workloadHours: z.number(),
                durationSemesters: z.number(),
                modality: z.string(),
                isActive: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            )
          }),
        401: z.object({
                    message: z.string(),
                  }),
        404: z.object({ 
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
        .select()
        .from(courses)
      
      if(result.length === 0) { 
        return reply.status(404).send({ message: "No courses registered" })
      }

      return reply.status(200).send({ courses: result });
    } catch (err) { 
      request.log.error(err);
      return reply.status(500).send({ message: "Cannot complete this request, error." })
    }
  })
}