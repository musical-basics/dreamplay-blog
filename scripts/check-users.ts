import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Client } from 'pg'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

dotenv.config({ path: path.resolve(dirname, '../.env.local') })

const checkUsers = async () => {
    const client = new Client({
        connectionString: process.env.PAYLOAD_DATABASE_URI,
    })

    try {
        await client.connect()
        const res = await client.query('SELECT * FROM users')

        console.log(`Found ${res.rowCount} users.`)
        if (res.rowCount && res.rowCount > 0) {
            console.log('Users exist:', res.rows.map((u: any) => u.email).join(', '))
        } else {
            console.log('No users found.')
        }
    } catch (err) {
        console.error('Database error:', err)
    } finally {
        await client.end()
    }
}

checkUsers()
