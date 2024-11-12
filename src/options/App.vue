<template>
  <div class="grid">
    <div class="row flex justify">
      <span>v{{ version }}</span>
    </div>
    <div class="p-2">
      <FloatLabel variant="in" class="w-full md:w-56">
        <MultiSelect
          v-model="config.langWatch"
          :options="competitionLanguages"
          option-label="label"
          fluid
          id="competition_language"
          option-value="value"
          filter
          class="w-full flex-1"
        >
          <template #option="slotProps">
            <span
              :alt="slotProps.option.label"
              class="flag"
              :class="{ [`flagid${slotProps.option.flag}`]: true }"
            />
            <div class="text-xl">{{ slotProps.option.label }}</div>
          </template>
        </MultiSelect>
        <label for="competition_language">{{ tr('competition_language') }}</label>
      </FloatLabel>
    </div>
    <div class="p-2">
      <FloatLabel variant="in" class="w-full md:w-56">
        <Select
          v-model="config.websiteLanguage"
          :options="competitionLanguages"
          option-label="label"
          fluid
          id="website_language"
          option-value="value"
          class="w-full flex-1"
        >
          <template #option="slotProps">
            <span
              :alt="slotProps.option.label"
              class="flag"
              :class="{ [`flagid${slotProps.option.flag}`]: true }"
            />
            <div class="text-xl">{{ slotProps.option.label }}</div>
          </template>
        </Select>
        <label for="website_language">{{ tr('website_language') }}</label>
      </FloatLabel>
    </div>
    <div class="p-2">
      <FloatLabel variant="in">
        <Select
          v-model="config.openOption"
          :options="Object.values(OpenOption)"
          fluid
          id="open_option"
        >
          <template #option="slotProps">
            {{ tr(slotProps.option) }}
          </template>
          <template #value="slotProps">
            {{ tr(slotProps.value) }}
          </template>
        </Select>
        <label for="open_option">{{ tr('noCompet_option') }}</label>
      </FloatLabel>
    </div>
    <div class="p-2 flex">
      <ToggleSwitch v-model="config.createIfPossible" id="create_if_possible" />
      <label class="p-2" for="create_if_possible">{{ tr('try_create_compet') }}</label>
    </div>
    <div class="p-2 flex">
      <ToggleSwitch v-model="config.notifyOnCreation" id="notification_enabled" />
      <label class="p-2" for="notification_enabled">{{ tr('notification_option') }}</label>
    </div>
    <div class="p-2">
      <FloatLabel variant="in">
        <InputNumber
          id="notification_timeout"
          v-model="config.checkTimeout"
          inputId="integeronly"
          fluid
          :min="1"
          :max="60"
        />
        <label for="notification_timeout">{{ tr('refresh_option') }}</label>
      </FloatLabel>
    </div>
    <div class="p-2">
      <Button fluid @click="() => save()" :label="tr('confirm_save')" />
    </div>
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { FloatLabel, MultiSelect, Select, ToggleSwitch, InputNumber, Button } from 'primevue'
import { useToast } from 'primevue/usetoast'
import { availableLang, type Config, DEFAULT_CONFIG, OpenOption } from '@/common'
import { onBeforeMount, reactive, toRaw } from 'vue'

const tr = chrome.i18n.getMessage
const config = reactive({ ...DEFAULT_CONFIG })
const toast = useToast()

onBeforeMount(async () => {
  const savedConfig: Config = (await chrome.storage.sync.get()) ?? {}
  for (const [key, value] of Object.entries(savedConfig)) {
    config[key as keyof Config] = value as never
  }
})

const version = chrome.runtime.getManifest().version

const competitionLanguages = Object.entries(availableLang).map(([k, v]) => {
  return { value: k, label: v.value, flag: v.flagId }
})

async function save() {
  console.log('saving configuration')
  try {
    const toSave = toRaw(config)
    await chrome.storage.sync.set(toSave)
    toast.add({
      detail: tr('option_saved'),
      severity: 'success',
      summary: 'Success',
      life: 3000,
    })
  } catch (ex) {
    toast.add({
      detail: ex,
      severity: 'error',
      summary: 'Error',
      life: 30000,
    })
  }
}
</script>
