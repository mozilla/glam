<script>
import BodyControl from './BodyControl.svelte';
import { percentileLineColorMap as cmp } from '../../components/data-graphics/utils/color-maps';
// '../../../../../components/data-graphics/utils/color-maps';
export let percentiles = [50];
</script>

<BodyControl
  options={[
      { label: '5%', value: 5, labelColor: cmp(5) },
      { label: '25%', value: 25, labelColor: cmp(25) },
      { label: '50%', value: 50, labelColor: cmp(50) },
      { label: '75%', value: 75, labelColor: cmp(75) },
      { label: '95%', value: 95, labelColor: cmp(95) },
    ]}
    reverse={true}
    bind:selected={percentiles}
    multi={true}
    level="low"
/>