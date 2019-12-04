import { storiesOf } from '@storybook/svelte';
import SimpleAxisStory from './SimpleAxisStory.svelte';
import Markers from './Markers.svelte';

import '../../../public/static/global.css';

storiesOf('Data Graphics|Guides', module)
  .add('Simple Axes', () => ({
    Component: SimpleAxisStory,
  })).add('Markers', () => ({
    Component: Markers,
  }));
