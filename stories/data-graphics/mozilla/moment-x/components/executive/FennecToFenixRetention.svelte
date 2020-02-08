<script>
import { getContext } from 'svelte';
import Subsection from '../Subsection.svelte';
import Row from '../Row.svelte';
import LineChart from '../LineChart.svelte';
import BigNumber from '../BigNumber.svelte';
import { formats, dmy } from '../../utils/formatters';
import { productColors } from '../../utils/color';

const metricData = getContext('data');
const markers = getContext('markers');
// capture hoverPoint.
let hoverPoint = {};
let focusValue = metricData[metricData.length - 1];
let defaultHover = true;
$: if (hoverPoint) {
  focusValue = hoverPoint;
  defaultHover = false;
} else {
  focusValue = metricData[metricData.length - 1];
  defaultHover = true;
}

</script>

  <Subsection>
    <h3 slot='title' id='fennec-to-fenix-migration-retention'>Core Retention Metrics</h3>
    <Row>
      <div class=at-a-glance>
        <BigNumber>
          <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span>
          <span slot='label'>Fennec Est. Retention % <span style="font-size: var(--text-06); color: var(--digital-blue-500)">•</span></span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fennecEstablishedRetention)}
          </span>
        </BigNumber>

        <BigNumber>
          <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span>
          <span slot='label'>Fennec to Fenix Retention % <span style="font-size: var(--text-06); color: var(--pantone-red-500)">•</span></span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fennecToFenixRetention)}
          </span>
          <span slot='compare'>

          </span>
        </BigNumber>
        <BigNumber>
          <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span>
          <span slot='label'>New Fenix Client Retention %  <span style="font-size: var(--text-06); color: orange">•</span></span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fenixEstablishedRetention)}
          </span>
          <span slot='compare'>

          </span>
        </BigNumber>
      </div>
    </Row>
    <Row>
      <LineChart
        title="Numbers"
        width={1104}
        right={5}
        description="sometimes, numbers really begin to pile up!"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        colors={[productColors.f2f, productColors.fennec, productColors.fenix]}
        bind:hoverPoint
        markers={markers}
      />
    </Row>
    <Row columns={'auto auto'}>
      <LineChart
        title="Fennec Retention Metrics"
        width={500}
        right={5}
        description="retention % for established Fennec profiles"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        colors={[productColors.f2f, productColors.fennec, productColors.fenix]}
        bind:hoverPoint
        markers={markers}
      />
      <LineChart
        title="Fenix Retention"
        width={500}
        right={5}
        description="sometimes, numbers really begin to pile up!"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        colors={[productColors.f2f, productColors.fennec, productColors.fenix]}
        bind:hoverPoint
        markers={markers}
      />
    </Row>
  </Subsection>