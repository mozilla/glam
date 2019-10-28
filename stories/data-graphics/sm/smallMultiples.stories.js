import { storiesOf } from '@storybook/svelte';
import Heatmap from './Heatmap.svelte';
import '../../../public/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Small Multiples', module)
  .add('Heatmap', () => ({
    Component: Heatmap,
  }));
