import { storiesOf } from '@storybook/svelte';
import Heatmap from './Heatmap.svelte';
import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Elements', module).add('Heatmap', () => ({
  Component: Heatmap,
}));
