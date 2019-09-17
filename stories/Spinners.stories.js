import { storiesOf } from '@storybook/svelte';
import SpinnerStory01 from './SpinnerStory01.svelte';

import '../public/global.css';

storiesOf('Spinners', module)
  .add('Radial Line Segment', () => ({
    Component: SpinnerStory01,
  }));
