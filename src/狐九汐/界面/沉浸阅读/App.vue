<template>
  <main
    ref="readerRoot"
    class="reader"
    :class="themeClasses[prefs.settings.theme]"
    :style="{ '--reader-size': `${prefs.settings.fontSize}px`, '--dialogue-color': dialogueColor }"
    @keydown.esc="closePanels"
  >
    <header class="masthead">
      <div class="seal" aria-hidden="true">镰<br />仓</div>
      <div class="masthead-copy">
        <h1>{{ calendar.title }}</h1>
        <p class="subtitle">
          {{ calendar.header }}
        </p>
      </div>
      <button class="gazetteer-button text-button" :aria-expanded="drawer" @click="drawer = !drawer">风物志</button>
      <button
        class="menu-button"
        :aria-expanded="settingsOpen"
        aria-controls="reader-settings"
        @click="settingsOpen = !settingsOpen"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 3v6M16 9v6M10 15v6" /></svg
        ><span>设置</span>
      </button>
    </header>

    <PaperReveal kind="panel">
      <section v-if="settingsOpen" id="reader-settings" class="settings panel" aria-label="阅读设置">
        <div class="section-title">
          <h2>读一封信的方式</h2>
          <button class="text-button" @click="settingsOpen = false">收起</button>
        </div>
        <fieldset>
          <legend>时节与光</legend>
          <div class="theme-grid">
            <button
              v-for="item in themes"
              :key="item.id"
              :class="['theme-choice', swatchClasses[item.id], { selected: prefs.settings.theme === item.id }]"
              :aria-pressed="prefs.settings.theme === item.id"
              @click="prefs.patch({ theme: item.id })"
            >
              <span>{{ item.short }}</span
              ><b>{{ item.label }}</b
              ><small>{{ item.note }}</small>
            </button>
          </div>
        </fieldset>
        <fieldset>
          <legend>双语阅读</legend>
          <div class="segmented">
            <button
              v-for="mode in modes"
              :key="mode.id"
              :aria-pressed="prefs.settings.bilingual === mode.id"
              :class="{ selected: prefs.settings.bilingual === mode.id }"
              @click="prefs.patch({ bilingual: mode.id })"
            >
              {{ mode.label }}
            </button>
          </div>
        </fieldset>
        <label class="dialogue-color-control"
          >本主题对话颜色<input
            aria-label="本主题对话颜色"
            type="color"
            :value="dialogueColor"
            @input="changeDialogueColor"
          /><button class="text-button" @click="resetDialogueColor">恢复原色</button></label
        >
        <label class="font-control"
          >正文字号 <output>{{ prefs.settings.fontSize }} px</output
          ><input
            aria-label="正文字号"
            type="range"
            min="13"
            max="26"
            step="0.5"
            :value="prefs.settings.fontSize"
            @input="changeFont"
        /></label>
        <div class="settings-bottom">
          <button
            class="text-button"
            :aria-pressed="prefs.settings.annotations"
            :disabled="annotationBusy"
            @click="toggleAnnotations"
          >
            文化注解 · {{ prefs.settings.annotations ? '开' : '关' }}
          </button>
        </div>
        <p class="annotation-explainer">
          开启后，正文中的文化词汇会带有细点下划线。鼠标悬停词语可展开风物笺，移开自动收起；手机轻点词语查看，再点任意处收起。出现过的词汇收进「风物志」。开关也会联动世界书「文化注解」，影响后续回复是否添加注解。关闭后只显示原词，已有词汇仍可在风物志查阅。
        </p>
        <label class="avatar-setting"
          >头像图片地址<input type="url" placeholder="https://…" :value="prefs.settings.avatar" @change="changeAvatar"
        /></label>
        <p class="hint">阅读偏好自动留存，下一封书简沿用。</p>
        <p v-if="notice || prefs.saveError" role="status" class="notice">{{ notice || prefs.saveError }}</p>
      </section>
    </PaperReveal>

    <PaperReveal kind="panel">
      <section v-if="drawer" class="glossary panel" aria-label="镰仓风物志">
        <div class="section-title">
          <h2>镰仓 · 风物志</h2>
          <button class="text-button" @click="drawer = false">合上</button>
        </div>
        <p v-if="!glossary.length" class="hint">风物尚未入册，且慢慢读。</p>
        <article v-for="item in glossary" :key="item.term">
          <h3>{{ item.term }}</h3>
          <p>{{ item.note }}</p>
        </article>
      </section>
    </PaperReveal>

    <section class="story" aria-label="故事正文">
      <div class="season-heading">
        <span>{{ currentTheme.label }}</span
        ><span class="chapter-mark">一 期 一 会</span>
      </div>
      <svg class="season-art" viewBox="0 0 600 100" aria-hidden="true">
        <g v-if="prefs.settings.theme === 'spring'" class="spring-art">
          <path d="M390 98 Q452 32 600 20 M450 53 Q465 7 512 3" />
          <g
            v-for="(flower, i) in flowers"
            :key="i"
            :transform="`translate(${flower[0]} ${flower[1]}) scale(${flower[2]})`"
          >
            <path
              d="M0 0 C-25 -16 -6 -30 0 -16 C6 -30 25 -16 0 0 C25 -16 33 7 16 5 C30 18 11 31 0 0 C11 31 -11 31 -9 15 C-25 23 -30 0 0 0"
            />
          </g>
          <path d="M75 30 Q85 15 91 28 Q89 42 75 30 M170 72 Q180 56 186 69 Q184 82 170 72" />
        </g>
        <g v-else-if="prefs.settings.theme === 'summer'" class="summer-art">
          <path d="M0 94 Q155 87 300 95 T600 90 M68 50v12 M127 14v12 M230 46v12 M344 18v12" />
          <g v-for="(flower, i) in flowers" :key="i" :transform="`translate(${flower[0]} ${flower[1]})`">
            <path d="M0 0 C-28 -22 -5 -36 0 -12 C5 -36 28 -22 0 0 C28 22 5 36 0 12 C-5 36 -28 22 0 0" />
          </g>
          <ellipse cx="163" cy="89" rx="38" ry="5" />
          <ellipse cx="312" cy="95" rx="48" ry="4" />
        </g>
        <g v-else-if="prefs.settings.theme === 'autumn'" class="autumn-art">
          <path d="M365 94 Q435 30 600 27" />
          <g
            v-for="(flower, i) in flowers"
            :key="i"
            :transform="`translate(${flower[0]} ${flower[1]}) rotate(${i * 25})`"
          >
            <path d="M0 20 L-4 5 -23 7 -15 -4 -20 -20 -5 -12 0 -30 6 -12 21 -20 16 -4 25 7 5 5 0 20 M0 4v25" />
          </g>
          <path d="M60 62 Q105 36 169 55 T271 44" />
        </g>
        <g v-else-if="prefs.settings.theme === 'winter'" class="winter-art">
          <path d="M0 85 Q90 69 180 89 T360 86 T600 87" />
          <g v-for="(flower, i) in flowers" :key="i" :transform="`translate(${flower[0]} ${flower[1]})`">
            <path d="M-13 0h26 M0 -13v26 M-9 -9 9 9 M9 -9 -9 9" />
          </g>
          <path d="M158 67l22 -33 22 33z M171 67v20" />
        </g>
        <g v-else-if="prefs.settings.theme === 'sunset'" class="sunset-art">
          <circle cx="450" cy="48" r="32" />
          <path
            d="M0 78 Q80 68 160 78 T320 78 T480 78 T640 78 M0 90 Q80 80 160 90 T320 90 T480 90 T640 90 M418 85h65 M432 95h35"
          />
        </g>
        <g v-else class="night-art">
          <path d="M451 5 A32 32 0 1 0 479 57 A31 31 0 0 1 451 5" />
          <path d="M120 0v23 M100 26h40v35h-40z M106 23h28 M108 36h24 M108 48h24 M120 61v13" />
          <circle cx="320" cy="29" r="1.5" />
          <circle cx="510" cy="80" r="2" />
          <circle cx="230" cy="67" r="1.5" />
        </g>
      </svg>
      <div class="story-body">
        <p v-if="!paragraphs.length" class="empty">信还在途中，等正文落笔。</p>
        <p v-for="(paragraph, index) in paragraphs" :key="index">
          <NarrativeTokens
            :tokens="paragraph"
            :mode="prefs.settings.bilingual"
            :annotations="prefs.settings.annotations"
            @term="showTerm"
            @term-leave="termInteraction.leave"
          />
        </p>
      </div>
      <footer class="story-footer"><span>此间一页，留待来日重读。</span></footer>
    </section>

    <section class="afterword" aria-label="读后札记">
      <div class="section-title afterword-title">
        <h2>书简之外</h2>
        <i></i>
      </div>
      <p v-if="!store.ready" class="hint">{{ store.error || '正等待本楼状态落笔，正文可先阅读。' }}</p>
      <div class="status-grid">
        <article
          ref="characterRoot"
          class="character-card panel"
          :class="{
            'bond-petals': bondProgress >= 0.2,
            'bond-lanterns': bondProgress >= 0.5,
            'bond-starlight': bondProgress >= 0.8,
          }"
        >
          <svg class="character-thread" :viewBox="`0 0 ${cardWidth} ${cardHeight}`" aria-hidden="true">
            <path :d="characterThread" pathLength="100" :stroke-dasharray="`${bondProgress * 100} 100`" />
          </svg>
          <span v-if="bondProgress >= 0.2" class="bond-petal" aria-hidden="true"></span>
          <span v-if="bondProgress >= 0.5" class="bond-lantern" aria-hidden="true">縁</span>
          <span v-if="bondProgress >= 0.8" class="bond-star" aria-hidden="true"></span>
          <div class="character-heading">
            <button class="avatar" aria-label="人物头像" @click="tapAvatar">
              <img v-if="avatarUrl && !avatarFailed" :src="avatarUrl" alt="汐的头像" @error="avatarFailed = true" /><svg
                v-else
                viewBox="0 0 80 80"
                aria-hidden="true"
              >
                <circle cx="40" cy="40" r="34" />
                <path
                  d="M20 45 L16 16 33 29 Q40 24 47 29 L64 16 60 45 Q55 64 40 67 Q25 64 20 45 M26 43l7 4 M54 43l-7 4 M36 55q4 5 8 0"
                />
              </svg>
            </button>
            <div>
              <h2 class="character-name">{{ prefs.settings.secretName ? '狐九汐' : '九条汐' }}</h2>
              <small>今日的她 · 助勤巫女</small>
            </div>
            <span class="mood">{{ store.data.狐九汐.心情 }}</span>
          </div>
          <blockquote>{{ store.data.狐九汐.心声 }}</blockquote>
          <section class="attire">
            <div class="attire-heading">
              <span>衣</span>
              <h3>衣上时光</h3>
              <i></i>
            </div>
            <p>{{ store.data.狐九汐.着装 }}</p>
          </section>
          <nav v-if="bondProgress >= 0.2" class="bond-menu" aria-label="缘结小笺">
            <button :aria-expanded="bondPanel === 'letter'" @click="bondPanel = bondPanel === 'letter' ? '' : 'letter'">
              花间笺
            </button>
            <button
              v-if="bondProgress >= 0.5"
              :aria-expanded="bondPanel === 'lamp'"
              @click="bondPanel = bondPanel === 'lamp' ? '' : 'lamp'"
            >
              灯下语
            </button>
            <button
              v-if="bondProgress >= 0.8"
              :aria-expanded="bondPanel === 'wish'"
              @click="bondPanel = bondPanel === 'wish' ? '' : 'wish'"
            >
              月下寄愿
            </button>
          </nav>
          <PaperReveal>
            <section v-if="bondPanel" class="bond-note">
              <template v-if="bondPanel === 'letter'"
                ><h3>花间笺</h3>
                <p>{{ bondCaption }}</p></template
              >
              <template v-else-if="bondPanel === 'lamp'"
                ><h3>灯下语</h3>
                <p>{{ store.data.狐九汐.心声 }}</p>
                <small>把此刻没有说出口的话，留在灯下。</small></template
              >
              <template v-else
                ><h3>月下寄愿</h3>
                <label
                  >写给自己的小小心愿<textarea
                    v-model="wishDraft"
                    rows="3"
                    maxlength="500"
                    placeholder="愿下一次相见……"
                  /></label
                ><button class="text-button" @click="saveWish">系在红线上</button
                ><small role="status">{{
                  wishSaved ? '心愿已收好。' : '只存作你的私笺，不会发送给角色。'
                }}</small></template
              >
            </section>
          </PaperReveal>
        </article>
        <article class="world-card panel">
          <div class="section-title">
            <h2>境内札记</h2>
            <span class="date-seal">{{ calendar.japanese }}</span>
          </div>
          <dl>
            <div>
              <dt>小钱袋</dt>
              <dd>{{ store.data.狐九汐.小钱袋.toLocaleString() }} <small>円</small></dd>
            </div>
          </dl>
          <section class="shopping-log">
            <h3>小小购记</h3>
            <p v-if="!store.data.狐九汐.购物日志.length" class="hint">钱袋还安静着，今天尚无购记。</p>
            <ol v-else>
              <li v-for="(log, index) in store.data.狐九汐.购物日志" :key="index">{{ log }}</li>
            </ol>
          </section>
        </article>
      </div>
    </section>

    <section class="omikuji" aria-label="御神签">
      <div class="section-title">
        <div>
          <h2>御神签</h2>
        </div>
        <span class="hint">一纸寄语，且听风吟</span>
      </div>
      <p v-if="!fortunes.length" class="no-fortune">签纸尚白。待故事里求得一签，再将它收在这里。</p>
      <div v-if="fortunes.length" class="fortune-tabs" role="tablist" aria-label="选择御神签">
        <button
          v-for="[owner] in fortunes"
          :key="owner"
          role="tab"
          :aria-selected="fortuneOwner === owner"
          aria-controls="fortune-sheet"
          @click="fortuneOwner = owner"
        >
          {{ owner }}<span>展开签纸</span>
        </button>
      </div>
      <PaperReveal>
        <article
          v-if="selectedFortune"
          id="fortune-sheet"
          :key="fortuneOwner"
          class="fortune-paper refined-fortune"
          role="tabpanel"
          :aria-label="`${fortuneOwner}的御神签`"
        >
          <button class="text-button fold-fortune" @click="fortuneOwner = ''">收签</button>
          <div class="fortune-rails" aria-hidden="true">奉 拝<br />開 運</div>
          <div class="fortune-center">
            <p class="fortune-heading">相 州 鎌 倉 · 佐 助 稲 荷</p>
            <p class="fortune-owner">{{ fortuneOwner }} 様</p>
            <h3>{{ selectedFortune.运势 || '待解' }}</h3>
            <small class="fortune-number">第 {{ selectedFortune.番号 || '未记' }} 号</small>
            <p class="verse">{{ selectedFortune.寄语 }}</p>
            <p class="interpretation">{{ selectedFortune.解签 }}</p>
            <dl>
              <div v-for="(value, label) in selectedFortune.个别运势" :key="label">
                <dt>{{ label }}</dt>
                <dd>{{ value || '—' }}</dd>
              </div>
            </dl>
            <footer>心 願 成 就</footer>
          </div>
        </article>
      </PaperReveal>
    </section>
    <PaperReveal kind="note">
      <aside
        v-if="activeTerm && prefs.settings.annotations"
        ref="termCard"
        class="anchored-note"
        :class="{ 'touch-note': activeTerm.source === 'touch' }"
        :style="termPosition"
        role="note"
        aria-live="polite"
        aria-label="风物笺注解"
      >
        <div class="note-caption">
          鎌倉 · 風物箋<span class="note-dismiss-hint">{{
            activeTerm.source === 'touch' ? '轻点任意处收起' : '移开即合笺'
          }}</span>
        </div>
        <h3>{{ activeTerm.term }}</h3>
        <p>{{ activeTerm.note }}</p>
        <span class="note-stamp" aria-hidden="true">知</span>
      </aside>
    </PaperReveal>
    <footer class="colophon">鎌 倉 <span>／</span> 此刻的风，留在纸上。</footer>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { calendarLabels } from './calendar';
import { useDataStore } from './store';
import { usePreferences, type Preferences } from './settings';
import { collectTerms, extractStory, tokenize } from './text';
import NarrativeTokens from './NarrativeTokens.vue';
import PaperReveal from './PaperReveal.vue';
import { useReaderMotion } from './motion';
import { createTermInteraction, type TermTrigger } from './term-interaction';
import './style.scss';

const store = useDataStore();
const prefs = usePreferences();
const settingsOpen = ref(false);
const drawer = ref(false);
const story = ref('');
const readerRoot = ref<HTMLElement>();
const characterRoot = ref<HTMLElement>();
const termCard = ref<HTMLElement>();
const activeTerm = ref<TermTrigger | null>(null);
useReaderMotion(readerRoot, () => prefs.settings.theme);
const termPosition = ref<Record<string, string>>({});
const { width: cardWidth, height: cardHeight } = useElementSize(
  characterRoot,
  { width: 320, height: 500 },
  { box: 'border-box' },
);
const characterThread = computed(() => {
  const w = cardWidth.value,
    h = cardHeight.value,
    x = w - 9,
    y = h - 9;
  return `M ${w / 2} 9 C ${w * 0.7} 24 ${w * 0.77} -3 ${x - 12} 13 Q ${x} 14 ${x} 33 C ${x - 14} ${h * 0.28} ${x + 5} ${h * 0.37} ${x} ${h * 0.52} S ${x - 12} ${h * 0.78} ${x} ${y - 19} Q ${x} ${y} ${x - 22} ${y} C ${w * 0.69} ${y - 12} ${w * 0.46} ${y + 6} 32 ${y} Q 9 ${y} 9 ${y - 22} C 22 ${h * 0.7} 1 ${h * 0.52} 9 ${h * 0.4} S 24 ${h * 0.15} 9 33 Q 9 9 31 9 C ${w * 0.3} 22 ${w * 0.39} 3 ${w / 2} 9`;
});
const calendar = computed(() => calendarLabels(store.data.世界.日期, store.data.世界.曜日, store.data.世界.时间));
const fortuneOwner = ref('');
const selectedFortune = computed(() => store.data.御神签[fortuneOwner.value]);
const bondPanel = ref('');
const wishDraft = ref(getVariables({ type: 'chat' }).hujiuxi_private_wish ?? '');
const wishSaved = ref(false);
async function saveWish() {
  await updateVariablesWith(v => ({ ...v, hujiuxi_private_wish: wishDraft.value }), { type: 'chat' });
  wishSaved.value = true;
}
watch(wishDraft, () => {
  wishSaved.value = false;
});
const defaultColors = {
  spring: '#aa6277',
  summer: '#747ba2',
  autumn: '#b0673e',
  winter: '#638595',
  sunset: '#b56d53',
  night: '#cfb48b',
};
const dialogueColor = computed(
  () => prefs.settings.dialogueColors[prefs.settings.theme] ?? defaultColors[prefs.settings.theme],
);
function changeDialogueColor(event: Event) {
  prefs.patch({
    dialogueColors: {
      [prefs.settings.theme]: (event.target as HTMLInputElement).value,
    },
  });
}
function resetDialogueColor() {
  prefs.patch({
    dialogueColors: { [prefs.settings.theme]: defaultColors[prefs.settings.theme] },
  });
}

const notice = ref('');
const annotationBusy = ref(false);
const avatarFailed = ref(false);
const avatarUrl = computed(() => (/^https?:\/\//i.test(prefs.settings.avatar) ? prefs.settings.avatar : ''));
watch(avatarUrl, () => {
  avatarFailed.value = false;
});
const themeClasses = {
  spring: 'theme-spring',
  summer: 'theme-summer',
  autumn: 'theme-autumn',
  winter: 'theme-winter',
  sunset: 'theme-sunset',
  night: 'theme-night',
};
const swatchClasses = {
  spring: 'swatch-spring',
  summer: 'swatch-summer',
  autumn: 'swatch-autumn',
  winter: 'swatch-winter',
  sunset: 'swatch-sunset',
  night: 'swatch-night',
};
const themes: { id: Preferences['theme']; short: string; label: string; note: string }[] = [
  { id: 'spring', short: '春', label: '春日樱花', note: '花笺 · 樱枝' },
  { id: 'summer', short: '夏', label: '初夏梅雨', note: '雨纹 · 紫阳花' },
  { id: 'autumn', short: '秋', label: '秋分红叶', note: '枫笺 · 金墨' },
  { id: 'winter', short: '冬', label: '冬日晴雪', note: '霜花 · 松影' },
  { id: 'sunset', short: '暮', label: '由比滨落日', note: '海纹 · 余晖' },
  { id: 'night', short: '夜', label: '雪洞幽玄', note: '弦月 · 纸灯' },
];
const currentTheme = computed(() => themes.find(t => t.id === prefs.settings.theme)!);
const modes: { id: Preferences['bilingual']; label: string }[] = [
  { id: 'zh', label: '中文为主' },
  { id: 'ja', label: '日文为主' },
  { id: 'only', label: '仅看译文' },
];
const flowers = [
  [425, 54, 0.8],
  [475, 28, 0.65],
  [512, 57, 1],
  [560, 32, 0.75],
];
const paragraphs = computed(() =>
  story.value
    .split(/\n+/)
    .filter(p => p.trim())
    .map(p => tokenize(p)),
);
const glossary = computed(() => collectTerms(story.value));
const fortunes = computed(() => Object.entries(store.data.御神签));
const bondProgress = computed(() => Math.min(1, Math.max(0, store.data.狐九汐.缘结值 / 1314)));
const bondCaption = computed(() =>
  bondProgress.value < 0.15
    ? '风起时，一缕红线轻落纸间。'
    : bondProgress.value < 0.4
      ? '来往的字句，悄悄织进同一根线。'
      : bondProgress.value < 0.7
        ? '绕过山与海，线的另一端仍在这里。'
        : bondProgress.value < 1
          ? '千回百转，渐渐结成一个温柔的名字。'
          : '红线绕成花，故事仍在往后生长。',
);
let avatarTaps = 0;
let lastTap = 0;
function tapAvatar() {
  const now = Date.now();
  avatarTaps = now - lastTap > 4000 ? 1 : avatarTaps + 1;
  lastTap = now;
  if (avatarTaps === 6) {
    prefs.patch({ secretName: !prefs.settings.secretName });
    avatarTaps = 0;
  }
}
function changeFont(event: Event) {
  prefs.patch({ fontSize: Number((event.target as HTMLInputElement).value) });
}
function changeAvatar(event: Event) {
  prefs.patch({ avatar: (event.target as HTMLInputElement).value.trim() });
}
function closePanels() {
  settingsOpen.value = false;
  drawer.value = false;
  closeTerm();
}
function positionTerm() {
  if (!activeTerm.value || !readerRoot.value) return;
  const anchor = activeTerm.value.anchor.getBoundingClientRect();
  const root = readerRoot.value.getBoundingClientRect();
  const width = Math.min(300, root.width - 24);
  const left = Math.max(12, Math.min(anchor.left - root.left, root.width - width - 12));
  termPosition.value = { left: `${left}px`, top: `${anchor.bottom - root.top + 9}px`, width: `${width}px` };
}
const termInteraction = createTermInteraction(
  value => {
    activeTerm.value = value;
    nextTick(positionTerm);
  },
  () => {
    activeTerm.value = null;
  },
);
function showTerm(value: TermTrigger) {
  termInteraction.open(value);
}
function closeTerm() {
  termInteraction.close();
}
function outsideTerm(event: Event) {
  termInteraction.click(event);
}
watch(() => [prefs.settings.theme, prefs.settings.fontSize, prefs.settings.bilingual], closeTerm);
watch(bondProgress, () => {
  bondPanel.value = '';
});
function refreshStory() {
  closeTerm();
  story.value = extractStory(getChatMessages(getCurrentMessageId())[0]?.message ?? '');
}
async function toggleAnnotations() {
  if (annotationBusy.value) return;
  annotationBusy.value = true;
  notice.value = '';
  const enabled = !prefs.settings.annotations;
  try {
    const bound = getCharWorldbookNames('current');
    const names = [...new Set([bound.primary, ...bound.additional].filter((n): n is string => Boolean(n)))];
    let found = false;
    for (const name of names) {
      const entries = await getWorldbook(name);
      if (!entries.some(e => e.name === '文化注解')) continue;
      await updateWorldbookWith(name, list => list.map(e => (e.name === '文化注解' ? { ...e, enabled } : e)));
      found = true;
    }
    if (!found) notice.value = '未找到绑定世界书的「文化注解」条目，仅切换正文注解。';
    prefs.patch({ annotations: enabled });
    if (!enabled) closeTerm();
  } catch (error) {
    notice.value = '注解切换未保存，请稍后重试。';
    console.warn('[狐九汐] 注解同步失败', error);
  } finally {
    annotationBusy.value = false;
  }
}
const listeners: EventOnReturn[] = [];
onMounted(() => {
  refreshStory();
  document.addEventListener('click', outsideTerm, true);
  if (window.parent !== window) window.parent.document.addEventListener('click', outsideTerm, true);
  window.addEventListener('blur', closeTerm);
  window.addEventListener('resize', positionTerm);
  [
    tavern_events.MESSAGE_UPDATED,
    tavern_events.MESSAGE_RECEIVED,
    tavern_events.MESSAGE_EDITED,
    tavern_events.MESSAGE_SWIPED,
  ].forEach(event => listeners.push(eventOn(event, refreshStory)));
});
onUnmounted(() => {
  listeners.forEach(l => l.stop());
  document.removeEventListener('click', outsideTerm, true);
  if (window.parent !== window) window.parent.document.removeEventListener('click', outsideTerm, true);
  window.removeEventListener('blur', closeTerm);
  window.removeEventListener('resize', positionTerm);
});
</script>
