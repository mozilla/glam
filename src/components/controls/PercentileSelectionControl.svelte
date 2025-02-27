<script>
  import { percentileLineColorMap as cmp } from '../../utils/color-maps';
  import BodyControl from './BodyControl.svelte';

  export let percentiles = [50];

  function t(v) {
    // We can even return a string built using a template literal
    return `${v}% of clients have seen this value or one smaller`;
  }
</script>

<BodyControl
  options={[
    {
      label: '0.1%',
      value: 0.1,
      labelColor: cmp(0.1),
      tooltip: t(0.1),
      enabled: true,
    },
    {
      label: '1%',
      value: 1,
      labelColor: cmp(1),
      tooltip: t(1),
      enabled: true,
    },
    {
      label: '5%',
      value: 5,
      labelColor: cmp(5),
      tooltip: t(5),
      enabled: true,
    },
    {
      label: '25%',
      value: 25,
      labelColor: cmp(25),
      tooltip: t(25),
      enabled: true,
    },
    {
      label: '50%',
      value: 50,
      labelColor: cmp(50),
      tooltip: t(50),
      enabled: true,
    },
    {
      label: '75%',
      value: 75,
      labelColor: cmp(75),
      tooltip: t(75),
      enabled: true,
    },
    {
      label: '95%',
      value: 95,
      labelColor: cmp(95),
      tooltip: t(95),
      enabled: true,
    },
    {
      label: '99%',
      value: 99,
      labelColor: cmp(99),
      tooltip: t(99),
      enabled: true,
    },
    {
      label: '99.9%',
      value: 99.9,
      labelColor: cmp(99.9),
      tooltip: t(99.9),
      enabled: true,
    },
  ]}
  reverse={true}
  bind:selected={percentiles}
  multi={true}
  level="medium"
  on:selection
  componentName="PercentileSelectionControl"
/>
