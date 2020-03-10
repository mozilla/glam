import Router from './routing/Router.svelte';
import { authenticate } from './utils/auth';
import { store } from './state/store';


authenticate((token) => {
  store.setField('token', token);
});

const router = new Router({
  target: document.body,
});

export default router;
