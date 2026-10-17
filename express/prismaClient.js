import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import pkg from '@prisma/client';
import { fileURLToPath } from 'node:url';

const { PrismaClient } = pkg;

const databasePath = fileURLToPath(new URL('./dev.db', import.meta.url));
const adapter = new PrismaBetterSqlite3({
  url: `file:${databasePath}`,
});

const prisma = new PrismaClient({ adapter });

export default prisma;