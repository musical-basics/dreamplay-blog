import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function serializeLexical(data: any): string {
  if (!data || !data.root || !data.root.children) return ''

  return data.root.children.map((node: any) => serializeNode(node)).join('')
}

function serializeNode(node: any): string {
  if (node.type === 'text') {
    let text = node.text
    // bold
    if (node.format & 1) text = `<strong>${text}</strong>`
    // italic
    if (node.format & 2) text = `<em>${text}</em>`
    // underline
    if (node.format & 8) text = `<u>${text}</u>`
    // strikethrough
    if (node.format & 4) text = `<span class="line-through">${text}</span>`
    // code
    if (node.format & 16) text = `<code>${text}</code>`

    return text
  }

  if (!node) return ''

  const children = node.children?.map((child: any) => serializeNode(child)).join('') || ''

  switch (node.type) {
    case 'paragraph':
      return `<p>${children}</p>`
    case 'heading':
      return `<${node.tag}>${children}</${node.tag}>`
    case 'list':
      const tag = node.listType === 'number' ? 'ol' : 'ul'
      return `<${tag}>${children}</${tag}>`
    case 'listitem':
      return `<li>${children}</li>`
    case 'quote':
      return `<blockquote>${children}</blockquote>`
    case 'link':
      return `<a href="${node.fields.url}" target="${node.fields.newTab ? '_blank' : '_self'}" rel="${node.fields.newTab ? 'noopener noreferrer' : ''}">${children}</a>`
    default:
      return children
  }
}
