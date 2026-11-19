import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

function buildDatabaseUrl(): string {
  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = process.env;

  if (
    POSTGRES_HOST &&
    POSTGRES_PORT &&
    POSTGRES_USER &&
    POSTGRES_PASSWORD &&
    POSTGRES_DB
  ) {
    const password = encodeURIComponent(POSTGRES_PASSWORD);
    return `postgresql://${POSTGRES_USER}:${password}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  }

  return process.env.DATABASE_URL ?? '';
}

const connectionString = buildDatabaseUrl();

if (!connectionString) {
  throw new Error('Database URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Admin';

  if (!email || !password) {
    console.warn(
      'Skip admin seed: set ADMIN_EMAIL and ADMIN_PASSWORD in .env',
    );
    return;
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      role: UserRole.ADMIN,
      password: hashedPassword,
      name,
      surname: null,
    },
    create: {
      email,
      password: hashedPassword,
      name,
      role: UserRole.ADMIN,
    },
  });

  console.log(`Admin user ready: ${admin.email} (${admin.id})`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
