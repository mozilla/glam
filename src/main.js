import Router from './routing/Router.svelte';
import Glean from '@mozilla/glean/web';

Glean.initialize("app-name", true, {
  enableAutoElementClickEvents: true,
  enableAutoPageLoadEvents: true
});

const router = new Router({
  target: document.body,
});

export default router;
