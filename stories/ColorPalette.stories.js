import { storiesOf } from '@storybook/svelte';
import ColorPalette from './ColorPalette.svelte';

import '../public/global.css';

storiesOf('Basics|Color', module)
  .add('Telemetry', () => ({
    Component: ColorPalette,
  }));
