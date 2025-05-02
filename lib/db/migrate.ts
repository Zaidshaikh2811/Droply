import { migrate } from "drizzle-orm/neon-http/migrator";

import { drizzle } from "drizzle-orm/neon-http";
import {neon} from "@neondatabase/serverless";

import * as dotenv from "dotenv";
 


dotenv.config({ path: '.env' });

if(!process.env.NEON_DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in .env file');
}


async function runMigrations() {
    try{
        const db = drizzle(neon(process.env.NEON_DATABASE_URL!), { logger: true });
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("Migrations completed successfully.");

    }catch(error) {
        console.error("Error running migrations:", error);
        process.exit(1);
    }
}

runMigrations()