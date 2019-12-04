import { storiesOf } from '@storybook/svelte';
import Sizes01 from './Sizes01.svelte';
import Depth01 from './Depth01.svelte';
import Color01 from './Color01.svelte';

import Fonts from './Fonts.svelte';
import TypographySizes from './TypographySizes.svelte';

import '../../public/static/global.css';

storiesOf('Principles|Spacing', module)
  .add('Spacing', () => ({
    Component: Sizes01,
  }));

storiesOf('Principles|Depth', module)
  .add('Depth', () => ({
    Component: Depth01,
  }));

storiesOf('Principles|Color', module)
  .add('Color', () => ({
    Component: Color01,
  }));

storiesOf('Principles|Type', module)
  .add('Fonts', () => ({
    Component: Fonts,
  }))
  .add('Sizes', () => ({
    Component: TypographySizes,
  }));
