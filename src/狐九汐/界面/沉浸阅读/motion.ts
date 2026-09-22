import { gsap } from 'gsap';
import { nextTick, onMounted, onBeforeUnmount, watch, type Ref } from 'vue';

export function useReaderMotion(root: Ref<HTMLElement | undefined>, theme: () => string) {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let context: gsap.Context | undefined;
  let mounted = false;
  const selector = (value: string) => root.value?.querySelectorAll(value) ?? [];
  function drawSeason() {
    if (!mounted || media.matches || !root.value) return;
    context?.add(() => {
      const strokes = [...selector('.season-art path, .season-art ellipse')];
      strokes.forEach((node, index) => {
        const path = node as SVGGeometryElement;
        const length = path.getTotalLength();
        gsap.fromTo(
          path,
          { strokeDasharray: length, strokeDashoffset: length },
          {
            strokeDashoffset: 0,
            duration: 0.72,
            delay: Math.min(index * 0.025, 0.18),
            ease: 'power2.out',
            clearProps: 'strokeDasharray,strokeDashoffset',
            overwrite: true,
          },
        );
      });
    });
  }
  function resetMotion() {
    context?.revert();
    if (mounted) context = gsap.context(() => {}, root.value);
  }
  onMounted(() => {
    mounted = true;
    context = gsap.context(() => {
      if (!media.matches)
        gsap.fromTo(
          selector('.seal'),
          { opacity: 0, scale: 1.07 },
          { opacity: 1, scale: 1, duration: 0.38, clearProps: 'opacity,transform', ease: 'power2.out' },
        );
    }, root.value);
    drawSeason();
    media.addEventListener('change', resetMotion);
  });
  watch(theme, async () => {
    resetMotion();
    await nextTick();
    drawSeason();
  });
  onBeforeUnmount(() => {
    mounted = false;
    context?.revert();
    media.removeEventListener('change', resetMotion);
  });
}
