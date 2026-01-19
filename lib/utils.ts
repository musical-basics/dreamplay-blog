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
    case 'upload':
      if (!node.value) return ''
      // Value might be the ID string if not populated, but usually it's the object at depth 1
      const src = node.value.url
      const alt = node.value.alt || ''
      // We simplified caption to be just text in the config earlier, but if it's not present it might be null
      const caption = node.fields?.caption || ''

      return `
        <figure class="my-8">
          <img src="${src}" alt="${alt}" class="rounded-lg border border-border bg-card transition-colors w-full" />
          ${caption ? `<figcaption class="text-sm text-center text-muted-foreground mt-2">${caption}</figcaption>` : ''}
        </figure>
      `
    default:
      return children
  }
}
