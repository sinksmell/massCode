<script setup lang="ts">
import { isMac } from '@/utils'

interface Props {
  showRail?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showRail: true,
})
</script>

<template>
  <div
    class="bg-background grid h-screen overflow-hidden"
    :class="props.showRail ? 'grid-cols-[64px_1fr]' : 'grid-cols-[1fr]'"
  >
    <div
      v-if="props.showRail"
      class="bg-muted/30 border-border/60 border-r backdrop-blur-sm"
      :class="isMac && 'mt-2.5'"
    >
      <SpaceRail />
    </div>
    <div class="min-h-0 min-w-0 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
