import { getPayload } from 'payload'
import configPromise from '../payload.config'

async function sync() {
    console.log('Syncing Payload schema to database...')
    try {
        const payload = await getPayload({ config: configPromise })
        console.log('Payload initialized. Schema should be synced (push: true).')
    } catch (error) {
        console.error('Failed to sync schema:', error)
        process.exit(1)
    }
    process.exit(0)
}

sync()
