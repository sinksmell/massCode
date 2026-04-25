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

  const rows: RagStoreChunk[] = contents.map((content, i) => ({
    contentId: content.id,
    embedding: embeddings[i],
    label: content.label,
    language: content.language,
    snippetId: snippet.id,
    snippetName: snippet.name,
    text: content.value,
  }))

  upsertChunks(rows)
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
