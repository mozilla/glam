<script>
import TweenToValue from 'udgl/data-graphics/motion/TweenToValue.svelte';
import Subsection from '../Subsection.svelte';
import Row from '../Row.svelte';
import LineChart from '../LineChart.svelte';
import BigNumber from '../BigNumber.svelte';
import { formats, dmy } from '../../utils/formatters';

let dates = (n = 40) => {
  let dt = new Date('2020-02-07');
  return Array.from({ length: n }).fill(null).map((_, i) => {
    let dt2 = new Date(dt);
    dt.setDate(dt.getDate() + 1);
    return dt2;
  });
};

let M = (Math.random() * 10);
let dau = 1000000 * M;
let wau = dau * 2;
let mau = dau * 3.5;
let usage = 2.5;
let r01 = 0.8;
let r02 = 0.7;

const metricData = dates().map((date) => {
  dau += (Math.random() - 0.45) * 100000 * M;
  wau += (Math.random() - 0.45) * 50000 * M;
  mau += (Math.random() - 0.45) * 50000 * M;
  const r = Math.random();
  if (r < 0.005) {
    r01 += (Math.random() - 0.6) * 0.1;
  }
  return {
    date,
    dau,
    dauLow: dau * 0.95 * (1 - Math.random() / 8),
    dauHigh: dau * 1.1,
    wau,
    wauLow: wau * 0.95,
    wauHigh: wau * 1.05,
    mau,
    mauLow: mau * 0.9,
    mauHigh: mau * 1.1,
    usage: usage + (Math.random() - 0.5) * 0.1,
    retention01: r01 + (Math.random() - 0.5) * 0.05,
    retention02: r02 + (Math.random() - 0.5) * 0.05,
    fennecToFenixRetention: wau / 20000000,
    fennecEstablishedRetention: mau / 20000000,
    fenixEstablishedRetention: dau / 20000000,
  };
});


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
          <span slot='label'>Fennec Est. Retention %.</span>
          <span slot="big-number">
            {formats.percent2d(focusValue.fennecEstablishedRetention)}
          </span>
        </BigNumber>

        <BigNumber>
          <span slot='sublabel'>{defaultHover ? 'latest' : dmy(focusValue.date)}</span>
          <span slot='label'>Fennec to Fenix Retention %.</span>
          <span slot='big-number'>
            <span slot="big-number">
              {formats.percent2d(focusValue.fennecToFenixRetention)}
            </span>
          </span>
        </BigNumber>
        <!-- <BigNumber
          sublabel="latest"
          label="Fennec Established"
          value={focusValue.fennecEstablishedRetention}
          format=percent
        />
        <BigNumber
          sublabel="latest"
          label="Fennec to Fenix"
          value={focusValue.fennecToFenixRetention}
          format=percent
        /> -->
      </div>
    </Row>
    <Row>
      <LineChart
        title="Numbers"
        width={1104}
        description="sometimes, numbers really begin to pile up!"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        colors={['var(--digital-blue-500)', 'var(--pantone-red-500)', 'orange']}
        markers={[
            { location: new Date('2020-02-18'), label: 'beta' },
            { location: new Date('2020-03-11'), label: 'trickle' },
            { location: new Date('2020-04-07'), label: 'launch' },
            { location: new Date('2020-06-10'), label: 'Toronto' },
          ]}
        bind:hoverPoint
      />
    </Row>
    <Row columns={'auto auto'}>
      <LineChart
        title="Fennec Retention Metrics"
        width={500}
        description="retention % for established Fennec profiles"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        colors={['var(--digital-blue-500)', 'var(--pantone-red-500)', 'orange']}
        markers={[
            { location: new Date('2020-02-18'), label: 'beta' },
            { location: new Date('2020-03-11'), label: 'trickle' },
            { location: new Date('2020-04-07'), label: 'launch' },
            { location: new Date('2020-06-10'), label: 'Toronto' },
          ]}
      />
      <LineChart
        title="Fenix Retention"
        width={500}
        description="sometimes, numbers really begin to pile up!"
        data={metricData}
        yFormat=percent
        xAccessor=date
        yMax={1}
        yAccessor={['fennecToFenixRetention', 'fennecEstablishedRetention', 'fenixEstablishedRetention']}
        colors={['var(--digital-blue-500)', 'var(--pantone-red-500)', 'orange']}
        markers={[
            { location: new Date('2020-02-18'), label: 'beta' },
            { location: new Date('2020-03-11'), label: 'trickle' },
            { location: new Date('2020-04-07'), label: 'launch' },
            { location: new Date('2020-06-10'), label: 'Toronto' },
          ]}
      />
    </Row>
  </Subsection>