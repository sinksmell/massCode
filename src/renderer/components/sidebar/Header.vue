<script setup lang="ts">
interface Props {
  title: string
  sectionTitle?: string
}

defineProps<Props>()
</script>

<template>
  <div>
    <div
      class="text-foreground/90 flex h-8 items-center justify-between px-1.5 select-none"
    >
      <UiText
        variant="caption"
        weight="semibold"
        class="truncate tracking-wide uppercase"
      >
        {{ title }}
      </UiText>
      <div
        v-if="$slots.actions"
        class="flex items-center gap-1"
      >
        <slot name="actions" />
      </div>
    </div>
    <SidebarSectionHeader
      v-if="sectionTitle"
      :title="sectionTitle"
    >
      <template
        v-if="$slots.action"
        #action
      >
        <slot name="action" />
      </template>
    </SidebarSectionHeader>
  </div>
</template>
