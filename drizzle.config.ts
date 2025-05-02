import * as dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit'; 


dotenv.config({ path: '.env' });

if(!process.env.NEON_DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env file');
}

export default defineConfig({
  out: './drizzle',
  schema: './lib/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
