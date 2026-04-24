<script setup lang="ts">
import { Button } from '@/components/ui/shadcn/button'
import { useSonner } from '@/composables'
import { i18n, store } from '@/electron'
import ky from 'ky'

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
const isTesting = ref(false)
const { sonner } = useSonner()

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

async function testEmbeddingEndpoint() {
  isTesting.value = true

  try {
    await ky
      .post(
        `http://localhost:${store.preferences.get<number>('api.port')}/ai/embedding/test`,
        {
          json: {
            apiKey: apiKey.value,
            endpoint: endpoint.value,
            model: model.value,
            provider: provider.value,
          },
          timeout: 10000,
        },
      )
      .json()

    sonner({
      message: i18n.t('preferences:ai.embedding.test.success'),
      type: 'success',
    })
  }
  catch (error) {
    sonner({
      message: i18n.t('preferences:ai.embedding.test.failed', {
        error: error instanceof Error ? error.message : String(error),
      }),
      type: 'error',
    })
  }
  finally {
    isTesting.value = false
  }
}
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
      <template #actions>
        <Button
          variant="outline"
          :disabled="isTesting"
          @click="testEmbeddingEndpoint"
        >
          {{
            isTesting
              ? i18n.t("preferences:ai.embedding.test.testing")
              : i18n.t("preferences:ai.embedding.test.button")
          }}
        </Button>
      </template>
    </UiMenuFormItem>
  </UiMenuFormSection>
</template>
