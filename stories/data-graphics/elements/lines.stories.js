import { storiesOf } from '@storybook/svelte';
import Line01 from './Line01.svelte';
import Line02 from './Line02.svelte';
import Line03 from './Line03.svelte';
import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Elements', module)
  .add('Lines 01', () => ({
    Component: Line01,
  }))
  .add('Lines 02', () => ({
    Component: Line02,
  }))
  .add('Lines 03', () => ({
    Component: Line03,
  }));
