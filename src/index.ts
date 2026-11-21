import "dotenv/config";
import { buildApp } from "./app.ts";

const port = Number(process.env.PORT) || 3333;

const server = await buildApp();

server.listen(
  {
    port,
    host: "0.0.0.0",
  },
  (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }

    console.log(`HTTP server is running, ${address}`);
  }
);

export { server };