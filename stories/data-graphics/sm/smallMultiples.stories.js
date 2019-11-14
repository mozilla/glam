import { storiesOf } from '@storybook/svelte';
import Heatmap from './Heatmap.svelte';
import Markers from './Markers.svelte';
import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Small Multiples', module)
  .add('Heatmap', () => ({
    Component: Heatmap,
  })).add('Markers', () => ({
    Component: Markers,
  }));
