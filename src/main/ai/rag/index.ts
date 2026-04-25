import type { SnippetRecord } from '../../storage/contracts'

export interface RagChunk {
  contentId: number
  language: string
  snippetId: number
  snippetName: string
  text: string
}

const ragChunkByContentId = new Map<number, RagChunk>()

function normalizeTokens(input: string) {
  return input
    .toLowerCase()
    .split(/[^a-z0-9_]+/g)
    .filter(Boolean)
}

function scoreText(queryTokens: string[], chunkTokens: string[]) {
  if (!queryTokens.length || !chunkTokens.length) {
    return 0
  }

  const chunkTokenSet = new Set(chunkTokens)
  let overlap = 0

  for (const token of queryTokens) {
    if (chunkTokenSet.has(token)) {
      overlap++
    }
  }

  return overlap / Math.sqrt(queryTokens.length * chunkTokens.length)
}

export function clearRagIndex() {
  ragChunkByContentId.clear()
}

export function upsertSnippetInRagIndex(snippet: SnippetRecord) {
  for (const content of snippet.contents) {
    ragChunkByContentId.set(content.id, {
      contentId: content.id,
      language: content.language,
      snippetId: snippet.id,
      snippetName: snippet.name,
      text: content.value ?? '',
    })
  }
}

export function removeSnippetFromRagIndex(contentIds: number[]) {
  for (const contentId of contentIds) {
    ragChunkByContentId.delete(contentId)
  }
}

export function removeSnippetFromRagIndexBySnippetId(snippetId: number) {
  for (const [contentId, chunk] of ragChunkByContentId) {
    if (chunk.snippetId === snippetId) {
      ragChunkByContentId.delete(contentId)
    }
  }
}

export function syncSnippetInRagIndex(
  snippetId: number,
  snippet: SnippetRecord | null,
) {
  removeSnippetFromRagIndexBySnippetId(snippetId)
  if (snippet) {
    upsertSnippetInRagIndex(snippet)
  }
}

export function queryRagIndex(query: string, limit: number) {
  const queryTokens = normalizeTokens(query)

  return [...ragChunkByContentId.values()]
    .map((chunk) => {
      const chunkTokens = normalizeTokens(chunk.text)
      const score = scoreText(queryTokens, chunkTokens)

      return {
        ...chunk,
        score,
      }
    })
    .filter(chunk => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}
