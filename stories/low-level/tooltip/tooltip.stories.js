import { storiesOf } from '@storybook/svelte';

import TooltipStory from './TooltipStory.svelte';

import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('UX Components|Tooltip', module)
  .add('Basic Tooltip', () => ({
    Component: TooltipStory,
  }));
