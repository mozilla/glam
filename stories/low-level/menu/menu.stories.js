import { storiesOf } from '@storybook/svelte';

import BasicMenuStory from './BasicMenuStory.svelte';
import FloatingMenuStory from './FloatingMenuStory.svelte';

import '../../../public/global.css';
import '../../glean-design-stories.css';

storiesOf('UX Components|Menu', module)
  .add('Basic Menus', () => ({
    Component: BasicMenuStory,
  })).add('Floating Menus', () => ({
    Component: FloatingMenuStory,
  }));
