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

const deprecationDate = new Date('2020-06-22');

// capture hoverPoint.
let hoverPoint = {};
let focusValue = metricData[metricData.length - 1];
let hovered = false;
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
      <div class=at-a-glance>
        <BigNumber description="description here">
          <!-- <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span> -->
          <span slot='sublabel'>Fennec</span>

          <span slot='label'><span style="color: var(--digital-blue-500)">•</span> Est. Retention %</span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fennecEstablishedRetention)}
          </span>
        </BigNumber>

        <BigNumber description="description here">
          <!-- <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span> -->
          <span slot='sublabel'>Fennec-to-Fenix</span>
          <span slot='label'><span style="color: var(--pantone-red-500)">•</span> Overall Retention %</span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fennecToFenixRetention)}
          </span>
          <span slot='compare'>

          </span>
        </BigNumber>
        <BigNumber description="description here">
          <!-- <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span> -->
          <span slot='sublabel'>Fenix</span>
          <span slot='label'><span style="color: orange">•</span> New Client Retention %</span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fenixEstablishedRetention)}
          </span>
          <span slot='compare'>

          </span>
        </BigNumber>
      </div>
    <Row>
      <LineChart
        title="Retention Metrics"
        subtitle="Fennec-To-Fenix Clients"
        width={1104}
        right={5}
        description="sometimes, numbers really begin to pile up!"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        xMax={deprecationDate}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        labels={['F2F Overall Retention', 'Fennec Est. Retention', 'Fenix Est. Retention']}
        colors={[productColors.f2f, productColors.fennec, productColors.fenix]}
        markers={markers}
        bind:hoverPoint
        bind:hovered
      />
    </Row>
    <Row columns={'auto auto'}>
      <LineChart
        title="Fennec Retention"
        width={500}
        right={5}
        description="retention % for established Fennec clients"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        xMax={deprecationDate}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        labels={['Overall', 'Established', 'New']}
        colors={['var(--digital-blue-500)', 'var(--digital-blue-400)', 'var(--digital-blue-300)']}
        bind:hoverPoint
        bind:hovered
        markers={markers}
      />
      <LineChart
        title="Fenix Retention"
        width={500}
        right={5}
        description="retention metrics for established Fenix clients"
        data={metricData}
        yFormat=percent
        xAccessor=date
        xMax={deprecationDate}
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        labels={['Overall', 'Established', 'New']}
        colors={['var(--pantone-red-600)', 'var(--pantone-red-500)', 'var(--pantone-red-400)']}
        bind:hoverPoint
        markers={markers}
      />
    </Row>
  </Subsection>