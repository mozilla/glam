import { storiesOf } from '@storybook/svelte';
import RadioExamples from './RadioExamples.svelte'

import '../public/global.css'

storiesOf('RadioExamples', module)
  .add('RadioExamples', () => ({
    Component: RadioExamples,
  }));