import { storiesOf } from '@storybook/svelte';
import TypographySizes from './TypographySizes.svelte';
import Fonts from './Fonts.svelte';

import '../public/global.css';

storiesOf('Principles|Typography', module)
  .add('Sizes', () => ({
    Component: TypographySizes,
  }))
  .add('Fonts', () => ({
    Component: Fonts,
  }));
