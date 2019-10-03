import { storiesOf } from '@storybook/svelte';
import TypographySizes from './TypographySizes.svelte';

import '../public/global.css';

storiesOf('Basics|Typography', module)
  .add('Sizes', () => ({
    Component: TypographySizes,
  }));
