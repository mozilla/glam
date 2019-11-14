import { storiesOf } from '@storybook/svelte';
import SparkBarExamples from './SparkBarExamples.svelte';

import '../public/static/global.css';

storiesOf('Data Graphics|Spark Bar', module)
  .add('SparkBar', () => ({
    Component: SparkBarExamples,
  }));
