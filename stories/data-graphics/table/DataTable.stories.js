import { storiesOf } from '@storybook/svelte';
import QuantileTable from './QuantileTable.svelte';
import '../../../public/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Data Tables', module)
  .add('Quantile Table', () => ({
    Component: QuantileTable,
  }));
