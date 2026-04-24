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
    class="from-background via-background to-muted/20 grid h-screen overflow-hidden bg-linear-to-br"
    :class="props.showRail ? 'grid-cols-[72px_1fr]' : 'grid-cols-[1fr]'"
  >
    <div
      v-if="props.showRail"
      class="border-border/70 bg-background/65 border-r backdrop-blur-xl"
      :class="isMac && 'mt-2.5'"
    >
      <SpaceRail />
    </div>
    <div class="min-h-0 min-w-0 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
