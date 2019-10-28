import { storiesOf } from '@storybook/svelte';

import GenericQuantileView from './GenericQuantileView.svelte';

import '../../../public/global.css';
import './shared.css';

storiesOf('Data Graphics|Quantile Plot', module)
  .add('Quantile Explorer (numeric hists, scalar aggregations)', () => ({
    Component: GenericQuantileView,
  }));
