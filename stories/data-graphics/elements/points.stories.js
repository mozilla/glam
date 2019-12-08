import { storiesOf } from '@storybook/svelte';
import Point01 from './Point01.svelte';
import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Elements', module)
  .add('Points', () => ({
    Component: Point01,
  }));
