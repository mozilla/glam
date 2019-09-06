import { storiesOf } from '@storybook/svelte';
import SparkBarExamples from './SparkBarExamples.svelte'

import '../public/global.css'

storiesOf('Data Graphics', module)
  .add('SparkBar', () => ({
    Component: SparkBarExamples,
  }));