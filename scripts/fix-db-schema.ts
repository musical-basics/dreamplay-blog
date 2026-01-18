import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({ path: path.resolve(dirname, '../.env.local') })

const fixDb = async () => {
    const client = new Client({
        connectionString: process.env.PAYLOAD_DATABASE_URI,
    })

    try {
        await client.connect()
        console.log('Dropping users table (and cascading to sessions)...')
        // Cascade is important here because sessions depend on users
        await client.query('DROP TABLE IF EXISTS "users" CASCADE;')
        console.log('Successfully dropped users table.')

        console.log('Dropping users_sessions table just in case...')
        await client.query('DROP TABLE IF EXISTS "users_sessions" CASCADE;')
        console.log('Successfully dropped users_sessions table.')

    } catch (err) {
        console.error('Database error:', err)
    } finally {
        await client.end()
    }
}

fixDb()
