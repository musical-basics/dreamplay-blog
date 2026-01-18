import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({ path: path.resolve(dirname, '../.env.local') })

const listTables = async () => {
    const client = new Client({
        connectionString: process.env.PAYLOAD_DATABASE_URI,
    })

    try {
        await client.connect()

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)

        console.log('--- ALL PUBLIC TABLES ---')
        res.rows.forEach(row => console.log(row.table_name))

    } catch (err) {
        console.error('Database error:', err)
    } finally {
        await client.end()
    }
}

listTables()
