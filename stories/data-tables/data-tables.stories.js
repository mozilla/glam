import { storiesOf } from '@storybook/svelte';
import DataTable01 from './DataTable01.svelte';
import DataTable03 from './DataTable03.svelte';
import '../../public/static/global.css';
import '../glean-design-stories.css';

storiesOf('Data Tables', module)
  .add('Simple Data Table', () => ({
    Component: DataTable01,
  }))
  .add('GLAM probe table', () => ({
    Component: DataTable03,
  }));
