import Glean from '@mozilla/glean/web';
import Router from './routing/Router.svelte';

Glean.initialize('glam', true, {
  enableAutoElementClickEvents: true,
  enableAutoPageLoadEvents: true,
});

const router = new Router({
  target: document.body,
});

export default router;
