import GLAM from './routes/index.svelte';
import { authenticate } from './utils/auth';
import { store } from './state/store';

// FIXME: The next line needs to be removed and the lines below uncommented once the Auth0 credentials are configured correctly.
store.setField('token', 'some-fake-token');
// authenticate((token) => {
//   store.setField('token', token);
// });


const glam = new GLAM({
  target: document.body,
});

export default glam;
