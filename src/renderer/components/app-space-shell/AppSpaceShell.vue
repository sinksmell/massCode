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
    class="bg-background grid h-screen gap-2 overflow-hidden p-2"
    :class="
      props.showRail ? 'grid-cols-[72px_minmax(0,1fr)]' : 'grid-cols-[1fr]'
    "
  >
    <div
      v-if="props.showRail"
      class="bg-card/70 border-border/60 rounded-xl border backdrop-blur"
      :class="isMac && 'mt-2.5'"
    >
      <SpaceRail />
    </div>
    <div
      class="bg-card/40 border-border/60 min-h-0 min-w-0 overflow-hidden rounded-xl border shadow-sm"
    >
      <slot />
    </div>
  </div>
</template>
