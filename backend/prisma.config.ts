import dotenv from "dotenv";
dotenv.config();
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/db/schema",
  migrations: {
    path: "src/db/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
