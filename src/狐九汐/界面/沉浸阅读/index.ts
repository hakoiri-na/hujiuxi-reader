import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

$(() => {
  // Mount the reader immediately; MVU readiness affects only the status cards.
  const app = createApp(App).use(createPinia());
  app.mount('#app');
  console.info('[狐九汐] 阅读界面已挂载', getIframeName());
  $(window).on('pagehide', () => app.unmount());
});
