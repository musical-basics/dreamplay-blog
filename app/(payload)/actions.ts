'use server'

import { handleServerFunctions } from '@payloadcms/next/layouts'

export async function serverFunctions(args: any) {
    return handleServerFunctions(args)
}
