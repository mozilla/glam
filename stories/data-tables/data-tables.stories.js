import { storiesOf } from '@storybook/svelte';
import DataTable01 from './DataTable01.svelte';
import DataTable02 from './DataTable02.svelte';
import DataTable03 from './DataTable03.svelte';
import '../../public/static/global.css';
import '../glean-design-stories.css';

storiesOf('Data Tables', module)
  .add('Simple Data Table', () => ({
    Component: DataTable01,
  }))
  .add('REMOVE WHEN DONE WITH THIS BRANCH', () => ({
    Component: DataTable02,
  }))
  .add('GLAM probe table', () => ({
    Component: DataTable03,
  }));
