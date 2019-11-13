import { storiesOf } from '@storybook/svelte';
import QuantileTableStory from './QuantileTable.svelte';
import ProportionTableStory from './ProportionTable.svelte';
import '../../../public/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Data Tables', module)
  .add('Quantile Table', () => ({
    Component: QuantileTableStory,
  }))
  .add('Proportion Table', () => ({
    Component: ProportionTableStory,
  }));
