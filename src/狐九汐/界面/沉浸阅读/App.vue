<template>
  <main
    class="reader"
    :class="themeClasses[prefs.settings.theme]"
    :style="{ '--reader-size': `${prefs.settings.fontSize}px` }"
    @keydown.esc="closePanels"
  >
    <header class="masthead">
      <div class="seal" aria-hidden="true">佐<br />助</div>
      <div class="masthead-copy">
        <p class="eyebrow">KAMAKURA · A LETTER TO YOU</p>
        <h1>雨下书简</h1>
        <p class="subtitle">
          佐助稻荷 · {{ store.data.世界.日期 }} <span>{{ store.data.世界.时间 }}</span>
        </p>
      </div>
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
          文化注解 · {{ prefs.settings.annotations ? '开' : '关' }}</button
        ><button class="text-button" @click="drawer = !drawer">镰仓 · 风物志</button>
      </div>
      <label class="avatar-setting"
        >头像图片地址<input type="url" placeholder="https://…" :value="prefs.settings.avatar" @change="changeAvatar"
      /></label>
      <p class="hint">阅读偏好自动留存，下一封书简沿用。</p>
      <p v-if="notice || prefs.saveError" role="status" class="notice">{{ notice || prefs.saveError }}</p>
    </section>

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

    <section class="story" aria-label="故事正文">
      <svg class="thread-border" viewBox="0 0 800 1000" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M400 10 H774 Q790 10 790 26 V974 Q790 990 774 990 H26 Q10 990 10 974 V26 Q10 10 26 10 H400"
          pathLength="100"
          :stroke-dasharray="`${bondProgress * 100} 100`"
        />
      </svg>
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
          />
        </p>
      </div>
      <aside v-if="activeTerm && prefs.settings.annotations" class="term-note" role="note">
        <button class="text-button" aria-label="关闭注释" @click="activeTerm = ''">合上</button
        ><strong>{{ activeTerm }}</strong>
        <p>{{ glossary.find(item => item.term === activeTerm)?.note }}</p>
      </aside>
      <footer class="story-footer">
        <div class="knot" role="img" :aria-label="bondCaption">
          <svg viewBox="0 0 320 112" aria-hidden="true">
            <path class="knot-ghost" :d="knotPath" />
            <path :d="knotPath" pathLength="100" :stroke-dasharray="`${bondProgress * 100} 100`" />
            <circle v-if="bondProgress > 0.3" cx="160" cy="56" r="3" />
            <path v-if="bondProgress > 0.7" class="knot-tail" d="M151 70l-5 29 M169 70l5 29 M142 98h8 M170 98h8" />
          </svg>
        </div>
        <p>{{ bondCaption }}</p>
        <span>縁は、静かに結ばれてゆく。</span>
      </footer>
    </section>

    <section class="afterword" aria-label="读后札记">
      <div class="section-title afterword-title">
        <span class="eyebrow">AFTER THE LETTER</span>
        <h2>书简之外</h2>
        <i></i>
      </div>
      <p v-if="!store.ready" class="hint">{{ store.error || '正等待本楼状态落笔，正文可先阅读。' }}</p>
      <div class="status-grid">
        <article class="character-card panel">
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
              <p class="eyebrow">SASUKE INARI</p>
              <h2 class="character-name">{{ prefs.settings.secretName ? '狐九汐' : '九条汐' }}</h2>
              <small>今日的她 · 助勤巫女</small>
            </div>
            <span class="mood">{{ store.data.狐九汐.心情 }}</span>
          </div>
          <blockquote>{{ store.data.狐九汐.心声 }}</blockquote>
          <details class="outfit">
            <summary>衣上时光</summary>
            <p>{{ store.data.狐九汐.着装 }}</p>
          </details>
        </article>
        <article class="world-card panel">
          <div class="section-title">
            <h2>境内札记</h2>
            <span class="date-seal">{{ store.data.世界.曜日 }} 曜</span>
          </div>
          <dl>
            <div>
              <dt>所在</dt>
              <dd>镰仓 · 佐助稻荷神社</dd>
            </div>
            <div>
              <dt>时刻</dt>
              <dd>{{ store.data.世界.时间 }}</dd>
            </div>
            <div>
              <dt>小钱袋</dt>
              <dd>{{ store.data.狐九汐.小钱袋.toLocaleString() }} <small>円</small></dd>
            </div>
          </dl>
          <details v-if="store.data.狐九汐.购物日志.length" class="shopping">
            <summary>小小购记</summary>
            <p v-for="(log, index) in store.data.狐九汐.购物日志" :key="index">{{ log }}</p>
          </details>
        </article>
      </div>
    </section>

    <section class="omikuji" aria-label="御神签">
      <div class="section-title">
        <div>
          <p class="eyebrow">A WISH ON PAPER</p>
          <h2>御神签</h2>
        </div>
        <span class="hint">一纸寄语，且听风吟</span>
      </div>
      <p v-if="!fortunes.length" class="no-fortune">签纸尚白。待故事里求得一签，再将它收在这里。</p>
      <div class="fortune-grid">
        <article v-for="[owner, fortune] in fortunes" :key="owner" class="fortune-paper">
          <header>
            <span>{{ owner }}</span
            ><small>{{ fortune.番号 }}</small>
          </header>
          <p class="fortune-heading">佐 助 稲 荷</p>
          <h3>{{ fortune.运势 || '待解' }}</h3>
          <p class="verse">{{ fortune.寄语 }}</p>
          <p class="interpretation">{{ fortune.解签 }}</p>
          <dl>
            <div v-for="(value, label) in fortune.个别运势" :key="label">
              <dt>{{ label }}</dt>
              <dd>{{ value || '—' }}</dd>
            </div>
          </dl>
          <footer>心 願 成 就</footer>
        </article>
      </div>
    </section>
    <footer class="colophon">鎌 倉 <span>／</span> 此刻的风，留在纸上。</footer>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useDataStore } from './store';
import { usePreferences, type Preferences } from './settings';
import { collectTerms, extractStory, tokenize } from './text';
import NarrativeTokens from './NarrativeTokens.vue';
import './style.scss';

const store = useDataStore();
const prefs = usePreferences();
const settingsOpen = ref(false);
const drawer = ref(false);
const story = ref('');
const activeTerm = ref('');
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
const knotPath =
  'M8 84 C50 84 72 28 118 28 C153 28 199 82 221 60 C242 39 207 5 187 22 C170 39 201 86 228 79 C252 73 238 42 212 38 C168 30 129 98 100 76 C75 57 107 9 132 25 C156 42 128 85 111 62 C92 38 137 11 160 37 C184 64 145 99 135 72 C125 45 178 15 192 41 C209 74 242 88 312 84';
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
  activeTerm.value = '';
}
function showTerm(term: string) {
  activeTerm.value = term;
}
function refreshStory() {
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
    if (!enabled) activeTerm.value = '';
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
  [
    tavern_events.MESSAGE_UPDATED,
    tavern_events.MESSAGE_RECEIVED,
    tavern_events.MESSAGE_EDITED,
    tavern_events.MESSAGE_SWIPED,
  ].forEach(event => listeners.push(eventOn(event, refreshStory)));
});
onUnmounted(() => listeners.forEach(l => l.stop()));
</script>
