import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({ path: path.resolve(dirname, '../.env.local') })

const checkSchema = async () => {
    const client = new Client({
        connectionString: process.env.PAYLOAD_DATABASE_URI,
    })

    try {
        await client.connect()

        console.log('--- PUBLIC.USERS Table Schema ---')
        const usersRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public';
    `)
        console.log(usersRes.rows)

        console.log('--- USERS_SESSIONS Table Custom Schema ---')
        const sessionsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users_sessions';
    `)
        console.log(sessionsRes.rows)

    } catch (err) {
        console.error('Database error:', err)
    } finally {
        await client.end()
    }
}

checkSchema()
