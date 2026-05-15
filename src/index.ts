import fastifySwagger from "@fastify/swagger";
import { fastify } from "fastify";
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { getStudentsRoute } from "./routes/getStudentsRoute.ts";
import { createStudentRoute } from "./routes/createStudentsRoute.ts";

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }
});

if(process.env.NODE_ENVIRONMENT === "development") { 
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Sentinel Helpdesk API',
        description: 'API to helpdesk SAAS',
        version: '1.0.0',
      },
    },
    transform: jsonSchemaTransform,
  })
  
  server.register(scalarAPIReference, {
    routePrefix: "/docs",
    configuration: {
      title: 'Our API Reference',
      url: '/openapi.json',
      theme: 'deepSpace'
    },
  })
}

server.listen({ port: 3333, host: '0.0.0.0' }, (err) => {
  console.log("HTTP server is running!");
  if(err) {
    server.log.error(err);
  }
})

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(getStudentsRoute);
server.register(createStudentRoute);

export { server };