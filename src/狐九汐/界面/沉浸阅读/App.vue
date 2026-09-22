<template>
  <main class="reader" :class="[`theme-${theme}`, { compact: fontSize < 16 }]" :style="{ '--reader-size': `${fontSize}px` }">
    <header class="masthead">
      <div class="brand-mark">⛩</div>
      <div><p class="eyebrow">KAMAKURA · SASUKE INARI</p><h1>狐九汐 · 雨下书简</h1><p class="subtitle">{{ seasonLabel }} · {{ store.data.世界.日期 }} · {{ store.data.世界.时间 }}</p></div>
      <div class="header-actions"><button title="文化注解" :class="{ on: annotations }" @click="toggleAnnotations">✿ 注解</button><button title="风物志" @click="drawer = !drawer">☰ 风物志</button></div>
    </header>

    <section class="console panel">
      <div class="control"><span>阅读主题</span><select v-model="theme"><option value="day">昼·{{ seasonLabel }}</option><option value="sunset">暮·由比滨落日</option><option value="night">夜·雪洞幽玄</option></select></div>
      <div class="control"><span>双语模式</span><div class="segmented"><button v-for="mode in modes" :key="mode.id" :class="{ selected: bilingual === mode.id }" @click="bilingual = mode.id">{{ mode.label }}</button></div></div>
      <label class="slider-control"><span>字号 {{ fontSize }}px</span><input v-model.number="fontSize" type="range" min="13" max="23" step="1" /></label>
    </section>

    <section class="status-grid">
      <article class="panel character-card"><div class="fox-crest">狐</div><div class="card-heading"><span>九条汐 · 助勤巫女</span><strong>{{ store.data.狐九汐.心情 }}</strong></div><p class="thought">“{{ store.data.狐九汐.心声 }}”</p><div class="bond"><span>缘结</span><div class="track"><i :style="{ width: `${Math.min(100, store.data.狐九汐.缘结值 / 13.14)}%` }"></i></div><b>{{ store.data.狐九汐.缘结值 }}</b></div></article>
      <article class="panel world-card"><div class="card-heading"><span>境内札记</span><strong>星期{{ store.data.世界.曜日 }}</strong></div><div class="world-facts"><span>🌿 佐助稻荷神社</span><span>⏰ {{ store.data.世界.时间 }}</span><span>🦊 小钱袋 ¥{{ store.data.狐九汐.小钱袋.toLocaleString() }}</span></div><p class="outfit">{{ store.data.狐九汐.着装 }}</p></article>
    </section>

    <section class="story panel"><div class="story-ribbon">雨音与朱红鸟居</div><div class="story-body" v-html="renderedStory"></div></section>

    <section class="omikuji panel"><div class="omikuji-copy"><p class="eyebrow">OMIKUJI · 御神签</p><h2>把今天的心愿交给风</h2><p>汐汐说，签文不是答案，是给犹豫的人一盏小灯。</p><button class="draw-button" :disabled="drawing" @click="drawFortune">{{ drawing ? '签筒轻响……' : '摇签筒 · 展开已有签文' }}</button></div><div class="fortune-slip" :class="{ revealed: fortune }"><span v-if="fortune">{{ fortune.运势 }}</span><span v-else>御</span><small v-if="fortune">{{ fortune.寄语 }}</small></div></section>

    <aside v-if="drawer" class="glossary panel"><div class="drawer-head"><h2>镰仓·风物志</h2><button @click="drawer = false">×</button></div><p class="muted">本页已出现 {{ glossary.length }} 个词条</p><div v-for="item in glossary" :key="item.term" class="glossary-item"><b>✿ {{ item.term }}</b><p>{{ item.note }}</p></div><p v-if="!glossary.length" class="muted">继续阅读，风物会自己浮现。</p></aside>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { gsap } from 'gsap';
import { useDataStore } from './store';

const store = useDataStore();
const theme = ref<'day' | 'sunset' | 'night'>('day');
const fontSize = ref(17);
const bilingual = ref<'zh' | 'ja' | 'only'>('zh');
const annotations = ref(true);
const drawer = ref(false);
const drawing = ref(false);
const story = ref('');
const modes: { id: 'zh' | 'ja' | 'only'; label: string }[] = [{ id: 'zh', label: '中译主' }, { id: 'ja', label: '日文主' }, { id: 'only', label: '仅译文' }];

const seasonLabel = computed(() => {
  const date = store.data.世界.日期;
  const month = Number(date.match(/\d{4}[年/.-](\d{1,2})/)?.[1]);
  if (month >= 3 && month <= 5) return '春日樱花';
  if (month >= 9 && month <= 11) return '秋分红叶';
  if (month === 12 || month <= 2) return '冬日晴雪';
  if (date.includes('春')) return '樱花余香';
  if (date.includes('秋')) return '红叶初染';
  if (date.includes('冬')) return '雪灯微明';
  return '梅雨微风';
});
const source = computed(() => story.value);
const glossary = computed(() => {
  const seen = new Map<string, string>();
  for (const match of source.value.matchAll(/\{([^|{}]+)\|([^{}]+)\}/g)) seen.set(match[1], match[2]);
  return [...seen].map(([term, note]) => ({ term, note }));
});
const renderedStory = computed(() => {
  if (!source.value) return '<p>本楼暂无 &lt;gal&gt; 正文。</p>';
  let html = source.value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
  html = html.replace(/\{([^|{}]+)\|([^{}]+)\}/g, (_m, term, note) => annotations.value ? `<span class="gloss" title="${note}">${term}<sup>✿</sup></span>` : term);
  html = html.replace(/「([^|「」]+)\|([^「」]+)」/g, (_m, ja, zh) => bilingual.value === 'only' ? `<span class="dialogue zh">「${zh}」</span>` : bilingual.value === 'ja' ? `<span class="dialogue"><em>「${ja}」</em><small>${zh}</small></span>` : `<span class="dialogue"><small>${ja}</small>「${zh}」</span>`);
  return html.split(/\n+/).map(p => `<p>${p}</p>`).join('');
});
const fortune = computed(() => Object.values(store.data.御神签)[0]);
let animation: gsap.core.Timeline | undefined;
onUnmounted(() => animation?.kill());

function refreshStory() {
  try {
    const message = getChatMessages(getCurrentMessageId())[0]?.message ?? '';
    // 只读取完整正文区块，排除标签外的变量更新和控制内容。
    const sections = [...message.matchAll(/<gal\b[^>]*>([\s\S]*?)<\/gal>/gi)];
    story.value = sections.map(section => section[1].trim()).filter(Boolean).join('\n\n');
  } catch (error) {
    console.warn('[狐九汐] 正文读取失败', error);
    story.value = '';
  }
}
async function toggleAnnotations() {
  annotations.value = !annotations.value;
  try {
    const name = getWorldbookNames().find(n => n.includes('狐九汐'));
    if (!name) return;
    await updateWorldbookWith(name, entries => entries.map(entry => entry.name?.includes('文化注解') ? { ...entry, enabled: annotations.value } : entry));
  } catch (error) { console.warn('[狐九汐] 文化注解世界书同步失败', error); }
}
async function drawFortune() {
  if (drawing.value) return;
  drawing.value = true;
  animation = gsap.timeline({ onComplete: () => { drawing.value = false; } });
  animation.to('.fortune-slip', { rotation: -12, duration: 0.12, repeat: 7, yoyo: true })
    .to('.fortune-slip', { rotation: 0, y: -14, duration: 0.35 })
    .to('.fortune-slip', { y: 0, duration: 0.5, ease: 'back.out(2)' });

}
onMounted(() => { refreshStory(); eventOn(tavern_events.MESSAGE_UPDATED, refreshStory); eventOn(tavern_events.MESSAGE_RECEIVED, refreshStory); eventOn(tavern_events.MESSAGE_SWIPED, refreshStory); eventOn(tavern_events.MESSAGE_EDITED, refreshStory); });
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;600;700&family=Shippori+Mincho:wght@400;600;700&display=swap');
:root { --paper:#fffaf4; --ink:#342b2a; --red:#b33939; --blue:#6676a9; --bamboo:#718b75; --line:#d9c9b7; --shadow:0 10px 26px #6d4d3a18; }
* { box-sizing:border-box; } body { margin:0; background:transparent; color:var(--ink); font-family:'Noto Serif JP','Songti SC',serif; }
.reader { position:relative; width:100%; max-width:880px; margin:auto; padding:18px; background:var(--paper); border:1px solid var(--line); box-shadow:var(--shadow); overflow:hidden; font-size:var(--reader-size); transition:.35s; }
.reader::before { content:''; position:absolute; inset:0; pointer-events:none; opacity:.2; background-image:radial-gradient(#b9957d 0.5px,transparent .5px); background-size:7px 7px; }
.reader > * { position:relative; z-index:1; } .masthead{display:flex;gap:14px;align-items:center;border-bottom:1px solid var(--line);padding-bottom:15px}.brand-mark{font-size:40px;color:var(--red);font-family:serif}.eyebrow{margin:0;color:var(--red);font:600 .65em/1.4 'Shippori Mincho';letter-spacing:.18em}.masthead h1{margin:3px 0;font:700 1.45em 'Shippori Mincho'}.subtitle{margin:0;color:#88766c;font-size:.75em}.header-actions{margin-left:auto;display:flex;gap:6px;align-self:flex-start}.header-actions button,.segmented button,.control select,.draw-button{border:1px solid var(--line);background:#fffdf9;color:inherit;padding:7px 10px;font:inherit;font-size:.7em;cursor:pointer}.header-actions button.on{color:var(--red);border-color:var(--red)}.panel{background:#fffdf9;border:1px solid var(--line);box-shadow:0 4px 14px #6d4d3a0b}.console{display:flex;gap:14px;align-items:center;padding:10px;margin:15px 0}.control{display:flex;align-items:center;gap:7px;font-size:.72em}.segmented{display:flex}.segmented button.selected{background:var(--red);color:#fff;border-color:var(--red)}.slider-control{margin-left:auto;font-size:.72em;display:flex;align-items:center;gap:8px}.slider-control input{accent-color:var(--red);width:85px}.status-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.character-card,.world-card{padding:14px}.fox-crest{float:left;width:42px;height:42px;margin-right:10px;border:1px solid var(--red);border-radius:50%;display:grid;place-items:center;color:var(--red);font:700 1.4em serif}.card-heading{display:flex;justify-content:space-between;gap:8px;font-size:.8em}.card-heading strong{color:var(--red);font-size:.8em}.thought{clear:both;margin:14px 0 10px;color:#796761;font-size:.82em;font-style:italic;line-height:1.6}.bond{display:flex;align-items:center;gap:8px;font-size:.72em}.track{height:6px;flex:1;background:#eadfd3;border-radius:5px;overflow:hidden}.track i{display:block;height:100%;background:linear-gradient(90deg,#d48b82,var(--red));border-radius:5px}.world-facts{display:flex;gap:8px;flex-wrap:wrap;margin:15px 0;color:#6d675d;font-size:.7em}.outfit{margin:0;color:#796761;font-size:.76em;line-height:1.6}.story{margin-top:15px;padding:28px clamp(18px,5vw,55px);background:linear-gradient(100deg,#fffdf9,#fffaf4)}.story-ribbon{display:inline-block;color:var(--red);border-bottom:2px solid #d49a8e;padding-bottom:4px;margin-bottom:14px;font-size:.75em}.story-body{font-size:1em;line-height:2.15}.story-body p{margin:0 0 1em;text-indent:2em}.story-body .dialogue{display:inline-flex;flex-direction:column;line-height:1.35;color:var(--red);font-weight:600}.story-body .dialogue small{font-size:.68em;color:#8b7e7a;font-weight:400}.story-body .dialogue em{font-style:normal}.gloss{border-bottom:1px dashed var(--blue);color:#4f608d;cursor:help}.gloss sup{font-size:.6em;color:#c07a8e}.omikuji{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-top:15px;padding:15px 20px}.omikuji h2{margin:4px 0;font:600 1.15em 'Shippori Mincho'}.omikuji p:not(.eyebrow){margin:4px 0 12px;font-size:.76em;color:#786d66}.draw-button{background:var(--red);color:#fff;border-color:var(--red)}.fortune-slip{width:74px;height:108px;background:#f8e6b8;border:1px solid #c79b53;box-shadow:4px 5px 0 #bd8e4733;display:flex;align-items:center;justify-content:center;flex-direction:column;transform:rotate(4deg);font:700 1.4em serif;color:#9c3e32}.fortune-slip.revealed{transform:rotate(0)}.fortune-slip small{padding:8px;text-align:center;font:400 .48em/1.35 'Noto Serif JP';color:#705342}.glossary{position:absolute;z-index:4;right:12px;top:75px;width:min(330px,calc(100% - 24px));padding:16px;max-height:75%;overflow:auto;background:#fffaf4}.drawer-head{display:flex;justify-content:space-between;align-items:center}.drawer-head h2{margin:0;font:600 1em 'Shippori Mincho'}.drawer-head button{border:0;background:none;font-size:1.5em;color:var(--red)}.muted{font-size:.72em;color:#8b7e7a}.glossary-item{padding:10px 0;border-top:1px dashed var(--line)}.glossary-item b{color:var(--blue);font-size:.8em}.glossary-item p{margin:4px 0;font-size:.75em;line-height:1.55}.theme-sunset{--paper:#fff3e7;--red:#af4d35;--blue:#8b6473}.theme-night{--paper:#26272b;--ink:#eee4d6;--line:#55515a;--red:#e29a78;--blue:#aeb9e3;--shadow:0 8px 22px #0006}.theme-night .panel,.theme-night .header-actions button,.theme-night .control select,.theme-night .segmented button{background:#303136;color:var(--ink)}.theme-night .story{background:#292a2f}.theme-night .thought,.theme-night .world-facts,.theme-night .outfit,.theme-night .dialogue small{color:#bbb0a7}.theme-night .fortune-slip{background:#e7ce91;color:#633e32}@media(max-width:650px){.reader{padding:12px}.masthead{align-items:flex-start}.header-actions{flex-direction:column}.console{flex-wrap:wrap}.slider-control{margin-left:0}.status-grid{grid-template-columns:1fr}.story{padding:22px 16px}.omikuji{align-items:flex-start}.fortune-slip{flex:none}}
</style>
