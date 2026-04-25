import type { SnippetRecord } from '../../storage/contracts'
import { log } from '../../utils'
import { cosineSimilarity, embedText, embedTexts } from './embedder'

export interface RagChunk {
  contentId: number
  language: string
  snippetId: number
  snippetName: string
  text: string
}

interface IndexedChunk extends RagChunk {
  embedding: Float32Array
}

const ragChunkByContentId = new Map<number, IndexedChunk>()

function buildChunkText(snippetName: string, label: string, value: string) {
  // Prepend snippet context so chunks without much body text still match.
  return `${snippetName}\n${label}\n${value}`.trim()
}

export function clearRagIndex() {
  ragChunkByContentId.clear()
}

export async function upsertSnippetInRagIndex(snippet: SnippetRecord) {
  const contents = snippet.contents.filter(
    (content): content is typeof content & { value: string } =>
      typeof content.value === 'string' && content.value.trim().length > 0,
  )

  if (!contents.length) {
    return
  }

  const texts = contents.map(content =>
    buildChunkText(snippet.name, content.label, content.value),
  )

  let embeddings: Float32Array[]
  try {
    embeddings = await embedTexts(texts)
  }
  catch (error) {
    log('rag.embedTexts', error)
    return
  }

  for (let i = 0; i < contents.length; i++) {
    const content = contents[i]
    ragChunkByContentId.set(content.id, {
      contentId: content.id,
      embedding: embeddings[i],
      language: content.language,
      snippetId: snippet.id,
      snippetName: snippet.name,
      text: content.value,
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

export async function syncSnippetInRagIndex(
  snippetId: number,
  snippet: SnippetRecord | null,
) {
  removeSnippetFromRagIndexBySnippetId(snippetId)
  if (snippet) {
    await upsertSnippetInRagIndex(snippet)
  }
}

export async function queryRagIndex(query: string, limit: number) {
  const trimmed = query.trim()
  if (!trimmed || !ragChunkByContentId.size) {
    return []
  }

  let queryVec: Float32Array
  try {
    queryVec = await embedText(trimmed)
  }
  catch (error) {
    log('rag.embedText', error)
    return []
  }

  return [...ragChunkByContentId.values()]
    .map(chunk => ({
      contentId: chunk.contentId,
      language: chunk.language,
      score: cosineSimilarity(queryVec, chunk.embedding),
      snippetId: chunk.snippetId,
      snippetName: chunk.snippetName,
      text: chunk.text,
    }))
    .filter(chunk => chunk.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
}
