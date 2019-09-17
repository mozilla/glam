import { storiesOf } from '@storybook/svelte';
import RadioExamples from './RadioExamples.svelte';

import '../public/global.css';

storiesOf('UX Components|Radio', module)
  .add('Basic Radio Buttons', () => ({
    Component: RadioExamples,
  }));
