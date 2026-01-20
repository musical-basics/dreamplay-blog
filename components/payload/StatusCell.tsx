'use client'

import React from 'react'


interface StatusCellProps {
    rowData?: {
        _status?: 'published' | 'draft'
    }
    data?: {
        _status?: 'published' | 'draft'
    }
}

export const StatusCell: React.FC<StatusCellProps> = ({ rowData, data }) => {
    const status = (rowData || data)?._status || 'draft'
    const isPublished = status === 'published'

    return (
        <div className={`
      inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
      ${isPublished
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}
    `}>
            {isPublished ? 'Public' : 'Unlisted'}
        </div>
    )
}
