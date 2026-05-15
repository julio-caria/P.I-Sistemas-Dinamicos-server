import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DB_URL!, {
  logger: process.env.NODE_ENV === "development"
})