import { storiesOf } from '@storybook/svelte';
// import QuantilePlotExample01 from './QuantilePlotExample01.svelte';
// import QuantilePlotExample02 from './QuantilePlotExample02.svelte';

import ScalarAggregation from './ScalarAggregation.svelte';
import HistogramAggregation from './HistogramAggregation.svelte';

import '../../../public/global.css';
import './shared.css';

storiesOf('Data Graphics|Quantile Plot', module)
  .add('Exponential Histogram (gc_ms)', () => ({
    Component: HistogramAggregation,
  }))
  .add('Scalar View (active_ticks)', () => ({
    Component: ScalarAggregation,
  }));
