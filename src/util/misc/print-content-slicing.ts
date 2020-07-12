import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import xss = require('xss')

interface ContentSlice {
  type: 'regular' | 'bold'
  value: string
}

export function getContentSlices(content: string): ContentSlice[] {
  const DOMPurify = createDOMPurify(new JSDOM('').window as any)
  DOMPurify.setConfig({
    SANITIZE_DOM: true,
    SAFE_FOR_TEMPLATES: true,
  })

  const xssFilter = new xss.FilterXSS({
    css: false,
  })

  content = content.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  content = xssFilter.process(content)
  content = DOMPurify.sanitize(content)

  let startIndex = 0
  const slices: ContentSlice[] = []

  const BOLD_PATTERN = /\*([^*]+)\*/g
  let results: RegExpExecArray | null = BOLD_PATTERN.exec(content)

  while (results !== null) {
    const sliceBefore = content.slice(startIndex, results.index)

    if (sliceBefore)
      slices.push({
        type: 'regular',
        value: sliceBefore,
      })

    slices.push({
      type: 'bold',
      value: results[1], // match
    })

    startIndex = BOLD_PATTERN.lastIndex
    results = BOLD_PATTERN.exec(content)
  }

  const lastSlice = content.slice(startIndex)

  if (lastSlice) {
    slices.push({
      type: 'regular',
      value: lastSlice,
    })
  }

  return slices
}

export function renderSlices(slices: ContentSlice[]): string {
  return slices.reduce((prev: string, current: ContentSlice) => {
    const tag = current.type === 'bold' ? 'b' : 'span'
    return prev.concat(`<${tag}>${current.value}</${tag}>`)
  }, '')
}
