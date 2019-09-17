import { storiesOf } from '@storybook/svelte';
import Buttons from './Buttons.svelte';

import '../public/global.css';
import './glean-design-stories.css';

storiesOf('UX Components|Buttons', module)
  .add('Buttons', () => ({
    Component: Buttons,
  }));
