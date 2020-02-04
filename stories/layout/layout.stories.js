import { storiesOf } from '@storybook/svelte';

import CenteredBody from './CenteredBody.svelte';
import BigDrawerBody from './BigDrawerBody.svelte';

import '../../public/static/global.css';

storiesOf('Layout', module)
  .add('Centered Body', () => ({
    Component: CenteredBody,
  }))
  .add('BigDrawerBody', () => ({
    Component: BigDrawerBody,
  }));
