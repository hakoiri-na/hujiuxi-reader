<template>
  <template v-for="(token, index) in tokens" :key="index">
    <template v-if="token.kind === 'text'">{{ token.text }}</template>
    <template v-else-if="token.kind === 'term'">
      <button
        v-if="annotations"
        class="term"
        :aria-label="`${token.text}：查看注释`"
        @click="$emit('term', token.text)"
        @mouseenter="$emit('term', token.text)"
      >
        {{ token.text }}
      </button>
      <template v-else>{{ token.text }}</template>
    </template>
    <span
      v-else
      class="dialogue"
      :class="{ 'mode-zh': mode === 'zh', 'mode-ja': mode === 'ja', 'mode-only': mode === 'only' }"
    >
      <span class="ja" lang="ja"
        ><NarrativeTokens :tokens="token.ja" :mode="mode" :annotations="annotations" @term="$emit('term', $event)"
      /></span>
      <span class="zh"
        ><NarrativeTokens :tokens="token.zh" :mode="mode" :annotations="annotations" @term="$emit('term', $event)"
      /></span>
    </span>
  </template>
</template>
<script setup lang="ts">
import type { Token } from './text';
defineProps<{ tokens: Token[]; mode: 'zh' | 'ja' | 'only'; annotations: boolean }>();
defineEmits<{ term: [term: string] }>();
</script>
