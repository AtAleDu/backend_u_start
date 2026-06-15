import 'dotenv/config';
import { defineConfig } from 'prisma/config';

function buildDatabaseUrl(): string {
  const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB } =
    process.env;

  if (POSTGRES_HOST && POSTGRES_PORT && POSTGRES_USER && POSTGRES_PASSWORD && POSTGRES_DB) {
    const password = encodeURIComponent(POSTGRES_PASSWORD);
    return `postgresql://${POSTGRES_USER}:${password}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  }

  return process.env.DATABASE_URL ?? '';
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: buildDatabaseUrl(),
  },
});
