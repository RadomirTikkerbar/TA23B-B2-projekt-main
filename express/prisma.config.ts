import { defineConfig } from 'prisma/config'
import { fileURLToPath } from 'node:url'

const databasePath = fileURLToPath(new URL('./dev.db', import.meta.url))

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: `file:${databasePath}`,
  },
  migrations: {
    seed: 'node ./prisma/seed.js',
  },
})