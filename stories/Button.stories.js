import { storiesOf } from '@storybook/svelte';
import Buttons from './Buttons.svelte'

import '../public/global.css'

storiesOf('Buttons', module)
  .add('Button Styles', () => ({
    Component: Buttons,
  }));