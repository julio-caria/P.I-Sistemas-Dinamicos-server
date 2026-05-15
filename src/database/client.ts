import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const connectionString =
  process.env.DB_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Defina DB_URL ou DATABASE_URL no ficheiro .env (ex.: postgresql://postgres:postgres@localhost:5432/unigest).",
  );
}

const pool = new Pool({ connectionString });

export const db = drizzle({
  client: pool,
  logger: process.env.NODE_ENVIRONMENT === "development",
});
