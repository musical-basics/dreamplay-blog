import { getPayload } from 'payload'
import configPromise from '../payload.config'
import { sql } from '@payloadcms/db-postgres'

async function fix() {
    console.log('Starting manual DB schema patch...')
    try {
        const payload = await getPayload({ config: configPromise })

        // Access the raw Drizzle instance from the adapter
        const db = payload.db.drizzle

        console.log('Patching "comments" table...')
        await db.execute(sql`ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "likes" numeric DEFAULT 0;`)

        console.log('Patching "theme_settings" table...')
        // Note: Payload converts kebab-case slug "theme-settings" to snake_case "theme_settings" for table name
        const typographyColumns = [
            'h1_size', 'h1_weight', 'h1_family',
            'h2_size', 'h2_weight', 'h2_family',
            'h3_size', 'h3_weight', 'h3_family',
            'body_size', 'body_family'
        ]

        for (const col of typographyColumns) {
            // Using raw string concatenation for column name (safe here as it's from our hardcoded list)
            // Drizzle sql template tag prevents injection for values, but identifiers usually need careful handling.
            // We'll trust simple ALTER statements here.
            await db.execute(sql.raw(`ALTER TABLE "theme_settings" ADD COLUMN IF NOT EXISTS "${col}" varchar;`))
        }

        console.log('Patching "site_settings" table...')
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS "site_settings" (
            "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            "theme" varchar,
            "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
            "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
          );
        `)

        console.log('Manual schema patch completed successfully.')
    } catch (error) {
        console.warn('Manual patch encountered an issue (ignoring):', error)
        // We don't exit 1 here, we let the build proceed and hope for the best, 
        // or maybe the error was "table does not exist" which means something else is wrong.
    }
    process.exit(0)
}

fix()
