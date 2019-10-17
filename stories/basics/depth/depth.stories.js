import { storiesOf } from '@storybook/svelte';
import Depth01 from './Depth01.svelte';

import '../../../public/global.css';
import '../../glean-design-stories.css';

storiesOf('Principles|Depth', module)
  .add('Depth', () => ({
    Component: Depth01,
  }));
