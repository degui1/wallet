import { execSync } from 'node:child_process';
import { PrismaClient } from '../../generated/prisma';
import { env } from './env';
import { randomUUID } from 'node:crypto';

function generateDatabaseURL(schema: string) {
  const url = new URL(env.DATABASE_URL);
  url.searchParams.set('schema', schema);

  return url.toString();
}

export function generateTestSchema() {
  return randomUUID();
}

export function setup(schema: string) {
  const databaseURL = generateDatabaseURL(schema);

  process.env.DATABASE_URL = databaseURL;

  execSync('npx prisma migrate deploy', {
    env: {
      DATABASE_URL: databaseURL,
    },
  });
}

export function getPrisma(schema: string) {
  return new PrismaClient({
    datasources: {
      db: {
        url: generateDatabaseURL(schema),
      },
    },
  });
}

export async function teardown(schema: string) {
  const prisma = getPrisma(schema);
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
  await prisma.$disconnect();
}
