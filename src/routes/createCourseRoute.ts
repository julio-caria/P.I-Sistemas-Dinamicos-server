import { z } from "zod";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { cursos } from "../database/schema.ts";
import { db } from "../database/client.ts";

export const createCourseRoute: FastifyPluginAsyncZod = async (server) => {
  server.post("/api/courses", {
    schema: {
      description: "Register a course in database",
      summary: "",
      tags: ["Courses"],
      body: z.object({
        name: z.string().min(1, "Course name is required"),
        workload: z.number().min(1, "Workload is required"),
        semesters: z.number().min(1, "Number of semesters required"),
        modality: z.string().min(3, "Modality is required"),
        active: z.boolean().optional(),
      }),
      response: {
        201: z.object({
          courseId: z.string(),
        }),
        401: z.object({
          message: z.string(),
        })
      }
    }
  }, async (request, reply) => {
    try {
      const { name, workload, semesters, modality, active } = request.body;

      const result = await db
        .insert(cursos)
        .values({ nome: name, cargaHoraria: workload, duracaoSemestres: semesters, modalidade: modality, ativo: active })
      .returning()

      return reply.status(201).send({ courseId: result[0].id })
    } catch (err) {
      throw new Error(`Couldn't complete this request ${err}`);
    }
  })
}