import { storiesOf } from '@storybook/svelte';
import ColorPalette from './ColorPalette.svelte'

import '../public/global.css'

storiesOf('ColorPalette', module)
  .add('swatches', () => ({
    Component: ColorPalette,
  }));