import { REST_POST, REST_GET, REST_DELETE } from '@payloadcms/next/routes'
import config from '@/payload.config'

export const POST = REST_POST(config)
export const GET = REST_GET(config)
export const DELETE = REST_DELETE(config)
