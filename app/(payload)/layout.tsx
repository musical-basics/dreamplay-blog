/* This layout is strictly for Payload's admin UI isolation */
import '@payloadcms/next/css'
import { serverFunctions } from './actions'
import { importMap } from './admin/importMap.js'
import { RootLayout } from '@payloadcms/next/layouts'
import React from 'react'
import configPromise from '@/payload.config'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Args = {
    children: React.ReactNode
}

const Layout = ({ children }: Args) => (
    <RootLayout
        config={configPromise}
        importMap={importMap}
        serverFunction={serverFunctions}
    >
        {children}
    </RootLayout>
)

export default Layout
