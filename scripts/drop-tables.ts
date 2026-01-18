import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({ path: path.resolve(dirname, '../.env.local') })

const dropAll = async () => {
    const client = new Client({
        connectionString: process.env.PAYLOAD_DATABASE_URI,
    })

    try {
        await client.connect()
        console.log('Dropping all Payload tables...')

        // Ordered list to avoid FK constraint errors, or just use CASCADE on everything
        const tables = [
            'users',
            'users_sessions',
            'posts',
            'media',
            'payload_preferences',
            'payload_preferences_rels',
            'payload_migrations',
            'payload_locked_documents',
            'payload_locked_documents_rels',
            'payload_kv'
        ]

        for (const table of tables) {
            await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE;`)
            console.log(`Dropped ${table}`)
        }

        console.log('Successfully dropped all tables.')

    } catch (err) {
        console.error('Database error:', err)
    } finally {
        await client.end()
    }
}

dropAll()
