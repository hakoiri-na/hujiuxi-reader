import { defineStore } from 'pinia';
import { ref, onScopeDispose } from 'vue';
import { klona } from 'klona';
import { z } from 'zod';

export const Preferences = z.object({
  theme: z.enum(['spring', 'summer', 'autumn', 'winter', 'sunset', 'night']).catch('summer'),
  bilingual: z.enum(['zh', 'ja', 'only']).catch('zh'),
  fontSize: z.number().min(13).max(26).catch(17),
  annotations: z.boolean().catch(true),
  secretName: z.boolean().catch(false),
  avatar: z.string().catch(''),
  dialogueColors: z.record(z.string(), z.string().regex(/^#[0-9a-fA-F]{6}$/)).catch({}),
});
export type Preferences = z.infer<typeof Preferences>;
const key = 'hujiuxi_reader_preferences_v2';
const changed = 'hujiuxi_reader_preferences_changed';
export const usePreferences = defineStore('hujiuxi.preferences', () => {
  const read = () => Preferences.parse(getVariables({ type: 'global' })[key] ?? {});
  const settings = ref(read());
  const saveError = ref('');
  let pending = 0;
  let queue = Promise.resolve();
  function patch(value: Partial<Preferences>) {
    const changes = klona(value);
    settings.value = Preferences.parse({
      ...settings.value,
      ...changes,
      dialogueColors: { ...settings.value.dialogueColors, ...changes.dialogueColors },
    });
    pending++;
    queue = queue
      .then(async () => {
        await updateVariablesWith(
          variables => ({
            ...variables,
            [key]: klona(
              Preferences.parse({
                ...Preferences.parse(variables[key] ?? {}),
                ...changes,
                dialogueColors: {
                  ...Preferences.parse(variables[key] ?? {}).dialogueColors,
                  ...changes.dialogueColors,
                },
              }),
            ),
          }),
          { type: 'global' },
        );
        saveError.value = '';
        await eventEmit(changed);
      })
      .catch(error => {
        saveError.value = '阅读偏好保存失败，请重试。';
        console.warn('[狐九汐] 偏好保存失败', error);
      })
      .finally(() => {
        pending--;
      });
    return queue;
  }
  const listener = eventOn(changed, () => {
    if (!pending) settings.value = read();
  });
  onScopeDispose(() => listener.stop());
  return { settings, patch, saveError };
});
