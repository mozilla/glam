import { storiesOf } from '@storybook/svelte';
import Typography from './Typography.svelte';

import '../public/global.css';

storiesOf('Basics|Typography', module)
  .add('Typography', () => ({
    Component: Typography,
  }));
