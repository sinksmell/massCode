import type { SnippetRecord } from '../../storage/contracts'
import type { RagStoreChunk } from './store'
import { log } from '../../utils'
import { embedText, embedTexts } from './embedder'
import {
  clearAll,
  countChunks,
  getStoreDbPath,
  queryNearest,
  removeBySnippetId,
  upsertChunks,
} from './store'

export interface RagChunk {
  contentId: number
  language: string
  snippetId: number
  snippetName: string
  text: string
}

function buildChunkText(snippetName: string, label: string, value: string) {
  // Prepend snippet context so chunks without much body text still match.
  return `${snippetName}\n${label}\n${value}`.trim()
}

export function clearRagIndex() {
  clearAll()
}

export function getRagIndexStatus() {
  return {
    chunks: countChunks(),
    dbPath: getStoreDbPath(),
  }
}

export interface UpsertOutcome {
  chunksWritten: number
  reason?: 'empty' | 'embed-error' | 'store-error'
  error?: string
}

export async function upsertSnippetInRagIndex(
  snippet: SnippetRecord,
): Promise<UpsertOutcome> {
  const contents = snippet.contents.filter(
    (content): content is typeof content & { value: string } =>
      typeof content.value === 'string' && content.value.trim().length > 0,
  )

  if (!contents.length) {
    return { chunksWritten: 0, reason: 'empty' }
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
    return {
      chunksWritten: 0,
      reason: 'embed-error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  const rows: RagStoreChunk[] = contents.map((content, i) => ({
    contentId: content.id,
    embedding: embeddings[i],
    label: content.label,
    language: content.language,
    snippetId: snippet.id,
    snippetName: snippet.name,
    text: content.value,
  }))

  try {
    upsertChunks(rows)
  }
  catch (error) {
    log('rag.upsertChunks', error)
    return {
      chunksWritten: 0,
      reason: 'store-error',
      error: error instanceof Error ? error.message : String(error),
    }
  }

  return { chunksWritten: rows.length }
}

export function removeSnippetFromRagIndexBySnippetId(snippetId: number) {
  removeBySnippetId(snippetId)
}

export async function syncSnippetInRagIndex(
  snippetId: number,
  snippet: SnippetRecord | null,
) {
  removeBySnippetId(snippetId)
  if (snippet) {
    await upsertSnippetInRagIndex(snippet)
  }
}

export async function queryRagIndex(query: string, limit: number) {
  const trimmed = query.trim()
  if (!trimmed) {
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

  return queryNearest(queryVec, limit).filter(match => match.score > 0)
}
