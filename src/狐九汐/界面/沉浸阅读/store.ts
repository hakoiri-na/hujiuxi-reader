import { defineStore } from 'pinia';
import { ref, onMounted, onScopeDispose } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { Schema } from '../../schema';

// Presentation only: reading a historical message must never rewrite its MVU snapshot.
export const useDataStore = defineStore('hujiuxi.snapshot', () => {
  const data = ref(Schema.parse({}));
  const ready = ref(false);
  const error = ref('');
  let initialized = false;
  function refresh() {
    if (!initialized) return;
    const raw = getVariables({ type: 'message', message_id: getCurrentMessageId() }).stat_data;
    if (!raw) {
      ready.value = false;
      return;
    }
    const result = Schema.safeParse(raw);
    if (result.success) {
      data.value = result.data;
      ready.value = true;
      error.value = '';
    } else {
      error.value = '状态暂未就绪，正文仍可阅读。';
    }
  }
  useIntervalFn(refresh, 1200);
  let active = true;
  onScopeDispose(() => {
    active = false;
  });
  onMounted(async () => {
    await waitGlobalInitialized('Mvu');
    if (!active) return;
    initialized = true;
    refresh();
  });
  return { data, ready, error };
});
