import { storiesOf } from '@storybook/svelte';

import GenericQuantileView from './GenericQuantileView.svelte';
import GenericProportionView from './GenericProportionView.svelte';
// import QuantileTableStory from './QuantileTable.svelte';
// import ProportionTableStory from './ProportionTable.svelte';

import '../../../public/static/global.css';
import './shared.css';

storiesOf('Data Graphics|GLAM', module)
  .add('Quantile Explorer (numeric hists, scalar aggregations)', () => ({
    Component: GenericQuantileView,
  }))
  .add('Proportion Explorer (categorical data)', () => ({
    Component: GenericProportionView,
  }));
// .add('Quantile Table', () => ({
//   Component: QuantileTableStory,
// }))
// .add('Proportion Table', () => ({
//   Component: ProportionTableStory,
// }));
