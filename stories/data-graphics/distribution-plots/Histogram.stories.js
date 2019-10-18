import { storiesOf } from '@storybook/svelte';
import QuantilePlotExample01 from './QuantilePlotExample01.svelte';
import QuantilePlotExample02 from './QuantilePlotExample02.svelte';

import '../../../public/global.css';
import './shared.css';

storiesOf('Data Graphics|Quantile Plot', module)
  .add('gc_ms (exponential histogram)', () => ({
    Component: QuantilePlotExample01,
  }))
  .add('browser_engagement_tab', () => ({
    Component: QuantilePlotExample02,
  }));
