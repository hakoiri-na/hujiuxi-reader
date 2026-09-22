<template>
  <template v-for="(token, index) in tokens" :key="index">
    <template v-if="token.kind === 'text'">{{ token.text }}</template>
    <template v-else-if="token.kind === 'term'">
      <button
        v-if="annotations"
        class="term"
        :aria-label="`${token.text}：查看注释`"
        @click="openTerm(token, $event)"
        @pointerenter="hoverTerm(token, $event)"
        @pointerleave="leaveTerm($event)"
        @focus="focusTerm(token, $event)"
        @blur="leaveTerm($event)"
      >
        {{ token.text }}
      </button>
      <template v-else>{{ token.text }}</template>
    </template>
    <span v-else-if="token.kind === 'quote'" class="dialogue-single"
      >「<NarrativeTokens
        :tokens="token.children"
        :mode="mode"
        :annotations="annotations"
        @term="$emit('term', $event)"
        @term-leave="$emit('term-leave', $event)"
      />」</span
    >
    <span
      v-else
      class="dialogue"
      :class="{ 'mode-zh': mode === 'zh', 'mode-ja': mode === 'ja', 'mode-only': mode === 'only' }"
    >
      <span class="ja" lang="ja"
        ><NarrativeTokens
          :tokens="token.ja"
          :mode="mode"
          :annotations="annotations"
          @term="$emit('term', $event)"
          @term-leave="$emit('term-leave', $event)"
      /></span>
      <span class="zh"
        ><NarrativeTokens
          :tokens="token.zh"
          :mode="mode"
          :annotations="annotations"
          @term="$emit('term', $event)"
          @term-leave="$emit('term-leave', $event)"
      /></span>
    </span>
  </template>
</template>
<script setup lang="ts">
import type { Token } from './text';
import type { TermTrigger } from './term-interaction';
defineProps<{ tokens: Token[]; mode: 'zh' | 'ja' | 'only'; annotations: boolean }>();
const emit = defineEmits<{ term: [value: TermTrigger]; 'term-leave': [anchor: HTMLElement] }>();
function report(token: Extract<Token, { kind: 'term' }>, event: Event, source: TermTrigger['source']) {
  emit('term', { term: token.text, note: token.note, anchor: event.currentTarget as HTMLElement, event, source });
}
function hoverTerm(token: Extract<Token, { kind: 'term' }>, event: PointerEvent) {
  if (event.pointerType === 'mouse') report(token, event, 'hover');
}
function focusTerm(token: Extract<Token, { kind: 'term' }>, event: FocusEvent) {
  if ((event.currentTarget as HTMLElement).matches(':focus-visible')) report(token, event, 'keyboard');
}
function openTerm(token: Extract<Token, { kind: 'term' }>, event: MouseEvent) {
  const touch = ('pointerType' in event && event.pointerType === 'touch') || window.matchMedia('(hover: none)').matches;
  report(token, event, touch ? 'touch' : event.detail === 0 ? 'keyboard' : 'hover');
}
function leaveTerm(event: Event) {
  emit('term-leave', event.currentTarget as HTMLElement);
}
</script>
