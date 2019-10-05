import { storiesOf } from '@storybook/svelte';
import Sizes01 from './Sizes01.svelte';

import '../public/global.css';

storiesOf('Principles|Layout', module)
  .add('Spacing', () => ({
    Component: Sizes01,
  }));
