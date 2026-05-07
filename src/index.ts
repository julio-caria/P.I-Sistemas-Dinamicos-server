import { fastify } from "fastify";

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

server.listen({ port: 3333, host: '0.0.0.0' }, (err) => {
  console.log("HTTP server is running!");
  if(err) {
    server.log.error(err);
  }
})