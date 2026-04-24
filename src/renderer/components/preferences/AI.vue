<script setup lang="ts">
import { i18n, store } from '@/electron'

const provider = ref<string>(
  store.preferences.get('ai.embedding.provider') as string,
)
const endpoint = ref<string>(
  store.preferences.get('ai.embedding.endpoint') as string,
)
const model = ref<string>(
  store.preferences.get('ai.embedding.model') as string,
)
const apiKey = ref<string>(
  store.preferences.get('ai.embedding.apiKey') as string,
)

watch(provider, (value) => {
  store.preferences.set('ai.embedding.provider', value.trim())
})

watch(endpoint, (value) => {
  store.preferences.set('ai.embedding.endpoint', value.trim())
})

watch(model, (value) => {
  store.preferences.set('ai.embedding.model', value.trim())
})

watch(apiKey, (value) => {
  store.preferences.set('ai.embedding.apiKey', value.trim())
})
</script>

<template>
  <UiMenuFormSection :label="i18n.t('preferences:ai.label')">
    <UiMenuFormItem :label="i18n.t('preferences:ai.embedding.provider.label')">
      <UiInput
        v-model="provider"
        size="sm"
      />
      <template #description>
        {{ i18n.t("preferences:ai.embedding.provider.description") }}
      </template>
    </UiMenuFormItem>

    <UiMenuFormItem :label="i18n.t('preferences:ai.embedding.endpoint.label')">
      <UiInput
        v-model="endpoint"
        size="sm"
      />
      <template #description>
        {{ i18n.t("preferences:ai.embedding.endpoint.description") }}
      </template>
    </UiMenuFormItem>

    <UiMenuFormItem :label="i18n.t('preferences:ai.embedding.model.label')">
      <UiInput
        v-model="model"
        size="sm"
      />
      <template #description>
        {{ i18n.t("preferences:ai.embedding.model.description") }}
      </template>
    </UiMenuFormItem>

    <UiMenuFormItem :label="i18n.t('preferences:ai.embedding.apiKey.label')">
      <UiInput
        v-model="apiKey"
        type="password"
        autocomplete="off"
        size="sm"
      />
      <template #description>
        {{ i18n.t("preferences:ai.embedding.apiKey.description") }}
      </template>
    </UiMenuFormItem>
  </UiMenuFormSection>
</template>
