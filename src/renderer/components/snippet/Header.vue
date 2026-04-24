<script setup lang="ts">
import { Button } from '@/components/ui/shadcn/button'
import { useApp, useSnippets } from '@/composables'
import { i18n, ipc } from '@/electron'
import { Plus, Search, X } from 'lucide-vue-next'

const {
  isSearch,
  searchQuery,
  createSnippetAndSelect,
  clearSearch,
  search,
  searchSelectedIndex,
  selectSearchSnippet,
  displayedSnippets,
} = useSnippets()
const { isFocusedSearch } = useApp()

ipc.on('main-menu:find', () => {
  isFocusedSearch.value = true
})

watch(searchQuery, (v) => {
  if (v) {
    search()
  }
  else {
    clearSearch(true)
  }
})

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    const nextIndex = Math.min(
      searchSelectedIndex.value + 1,
      (displayedSnippets.value?.length || 0) - 1,
    )
    selectSearchSnippet(nextIndex)
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    const prevIndex = Math.max(searchSelectedIndex.value - 1, 0)
    selectSearchSnippet(prevIndex)
  }
  if (event.key === 'Escape') {
    event.preventDefault()
    clearSearch(true)
  }
}
</script>

<template>
  <div class="mt-[var(--content-top-offset)] mb-2 px-2">
    <div
      class="bg-muted/35 border-border/60 focus-within:border-border flex items-center rounded-lg border px-1.5 py-1 shadow-sm"
    >
      <Search class="text-muted-foreground ml-1 h-4 w-4" />
      <div class="flex-grow">
        <UiInput
          v-model="searchQuery"
          :placeholder="i18n.t('placeholder.search')"
          variant="ghost"
          :focus="isFocusedSearch"
          @blur="isFocusedSearch = false"
          @keydown="onKeydown"
        />
      </div>
      <Button
        v-if="searchQuery"
        variant="ghost"
        class="h-7 w-7 px-0"
        @click="clearSearch(true)"
      >
        <X class="h-4 w-4" />
      </Button>
      <UiActionButton
        v-if="!isSearch"
        :tooltip="i18n.t('action.new.snippet')"
        class="h-7 w-7"
        @click="createSnippetAndSelect"
      >
        <Plus class="h-4 w-4" />
      </UiActionButton>
    </div>
  </div>
</template>
