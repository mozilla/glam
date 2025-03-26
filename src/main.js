import Glean from '@mozilla/glean/web';
import Router from './routing/Router.svelte';

if (navigator.doNotTrack !== '1' && window.doNotTrack !== '1' && navigator.msDoNotTrack !== '1') {
  console.log('Initializing GleanJS.');
  Glean.initialize('glam', true, {
    enableAutoElementClickEvents: true,
    enableAutoPageLoadEvents: true,
  });
} else {
  console.warn('Skipping GleanJS initialization because Do Not Track is enabled in the browser.');
}
const router = new Router({
  target: document.body,
});

export default router;
