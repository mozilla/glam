import { storiesOf } from '@storybook/svelte';
import { ButtonGroup } from '@graph-paper/button';

import DataLoadSpinner01 from './DataLoadSpinner.svelte';
import DataLoadSpinner02 from './DataLoadSpinner02.svelte';
import DataError from '../../src/components/errors/DataError.svelte';
import LineSegSpinner from './LineSegSpinner.svelte';

import Buttons from './Buttons.svelte';

import Radio from './Radio.svelte';

import '../../public/static/global.css';
import '../glean-design-stories.css';

storiesOf('UX Components|Buttons', module)
  .add('Buttons', () => ({
    Component: Buttons,
  }))
  .add('Button Groups', () => ({
    Component: ButtonGroup,
  }));

storiesOf('UX Components|Radio', module).add('Radio', () => ({
  Component: Radio,
}));

storiesOf('UX Components|Spinners', module)
  .add('Line Segment Spinner', () => ({
    Component: LineSegSpinner,
  }))
  .add('Data Loading 01', () => ({
    Component: DataLoadSpinner01,
  }))
  .add('Data Loading 02', () => ({
    Component: DataLoadSpinner02,
  }))
  .add('Data Error 02', () => ({
    Component: DataError,
    props: { reason: 'The probe does not have percentiles available.' },
  }));
