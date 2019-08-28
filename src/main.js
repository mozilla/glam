import App from './App.svelte';

const app = new App({
  target: document.body, // eslint-disable-line no-undef
  props: {
    name: 'mdv2',
  },
});

export default app;
