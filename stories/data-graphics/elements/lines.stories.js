import { storiesOf } from '@storybook/svelte';
import Line01 from './Line01.svelte';
import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Elements', module)
  .add('Lines', () => ({
    Component: Line01,
  }));
