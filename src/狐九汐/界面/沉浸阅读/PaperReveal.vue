<template>
  <Transition
    :css="false"
    mode="out-in"
    @enter="enter"
    @leave="leave"
    @enter-cancelled="cancel"
    @leave-cancelled="cancel"
    ><slot
  /></Transition>
</template>
<script setup lang="ts">
import { onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';
const props = withDefaults(defineProps<{ kind?: 'panel' | 'note' }>(), { kind: 'panel' });
const elements = new Set<Element>();
const cleared =
  'height,opacity,overflow,clipPath,paddingTop,paddingBottom,marginTop,marginBottom,borderTopWidth,borderBottomWidth';
const folded = {
  height: 0,
  paddingTop: 0,
  paddingBottom: 0,
  marginTop: 0,
  marginBottom: 0,
  borderTopWidth: 0,
  borderBottomWidth: 0,
};
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function finish(el: Element, done: () => void) {
  gsap.set(el, { clearProps: cleared });
  elements.delete(el);
  done();
}
function enter(el: Element, done: () => void) {
  elements.add(el);
  gsap.killTweensOf(el);
  if (reduced()) {
    finish(el, done);
    return;
  }
  if (props.kind === 'note') {
    gsap.fromTo(
      el,
      { opacity: 0, clipPath: 'inset(0 0 8% 0)' },
      {
        opacity: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 0.16,
        ease: 'power2.out',
        onComplete: () => finish(el, done),
      },
    );
  } else {
    const height = el.getBoundingClientRect().height;
    const style = getComputedStyle(el);
    const expanded = Object.fromEntries(
      Object.keys(folded)
        .filter(key => key !== 'height')
        .map(key => [key, style[key as keyof CSSStyleDeclaration]]),
    );
    gsap.fromTo(
      el,
      { ...folded, opacity: 0, overflow: 'hidden' },
      { ...expanded, height, opacity: 1, duration: 0.28, ease: 'power2.out', onComplete: () => finish(el, done) },
    );
  }
}
function leave(el: Element, done: () => void) {
  elements.add(el);
  gsap.killTweensOf(el);
  if (reduced()) {
    finish(el, done);
    return;
  }
  gsap.to(el, {
    ...(props.kind === 'panel' ? { ...folded, overflow: 'hidden' } : {}),
    opacity: 0,
    duration: props.kind === 'note' ? 0.08 : 0.19,
    ease: 'power2.in',
    onComplete: () => finish(el, done),
  });
}
function cancel(el: Element) {
  gsap.killTweensOf(el);
  gsap.set(el, { clearProps: cleared });
  elements.delete(el);
}
onBeforeUnmount(() => elements.forEach(cancel));
</script>
