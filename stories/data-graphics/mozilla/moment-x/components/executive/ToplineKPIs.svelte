<script>
import TweenToValue from 'udgl/data-graphics/motion/TweenToValue.svelte';
import Subsection from '../Subsection.svelte';
import BigNumber from '../BigNumber.svelte';
import { formats } from '../../utils/formatters';

const KPIs = [
  {
    sublabel: 'Fennec to Fenix Transition',
    label: 'Established Active Users',
    value: ~~(100000 * Math.random()),
    format: 'rate',
  },
  {
    sublabel: 'Fennec to Fenix Transition',
    label: 'Retention',
    value: 0.8,
    format: 'percent',
  },
  {
    sublabel: 'Fennec to Fenix Transition',
    label: 'Growth Metric',
    value: -0.05,
    format: 'ratio',
  },
  {
    sublabel: 'Fennec to Fenix Transition',
    label: 'Success Metric',
    value: Math.random(),
    format: 'percent',
  },
];

</script>

  <Subsection>
    <h3 slot='title'>At a glance</h3>
    <div class="at-a-glance">

    {#each KPIs as {sublabel, label, value, format}, i}
      <BigNumber>
        <span slot=sublabel>{sublabel}</span>
        <span slot=label>{label}</span>
        <span slot=big-number>
          <TweenToValue to={value} let:value={tweenedValue}>
            {formats[format](tweenedValue)}
          </TweenToValue>
        </span>
      </BigNumber>
    {/each}
      <!-- <BigNumber>
        <span slot=sublabel>Fennec to Fenix Transition</span>
        <span slot=label>Established Active Users</span>
        <span slot=big-number>
          <TweenToValue to={1000000 + ~~(100000 * Math.random())} let:value>
            {formats.rate(value)}
          </TweenToValue>
        </span>
    </BigNumber>
  
    <BigNumber 
      sublabel="Fennec to Fenix Transition"
      label="Retention"
      value={0.8}
      format=percent
    >
    <span slot=sublabel>Fennec to Fenix Transition</span>
    <span slot=label>Retention</span>
    <span slot=big-number>
      <TweenToValue to={0.8} let:value>
        {formats.percent(value)}
      </TweenToValue>
    </span>
      
    </BigNumber>

    <BigNumber >
      <span slot=sublabel>Fennec to Fenix Transition</span>
      <span slot=label>Growth Metric</span>
      <span slot=big-number>
        <TweenToValue to={-0.05} let:value>
          {formats.ratio(value)}
        </TweenToValue>
      </span>  
    </BigNumber> -->

<!-- 
    <BigNumber 
      sublabel="Fennec to Fenix Transition"
      label="Growth Metric"
      value={-0.05}
      format=ratio
    />

    <BigNumber 
      sublabel="Fennec to Fenix Transition"
      label="Success Metric"
      value={1000000 + ~~(100000 * Math.random())}
      format=count
    />

    <BigNumber 
      sublabel="Fennec to Fenix Transition"
      label="Established Active Users"
      value={1000000 + ~~(100000 * Math.random())}
      format=count
    />

    <BigNumber 
      sublabel="Fennec to Fenix Transition"
      label="Established Active Users"
      value={1000000 + ~~(100000 * Math.random())}
      format=count
    /> -->
    </div>
  </Subsection>