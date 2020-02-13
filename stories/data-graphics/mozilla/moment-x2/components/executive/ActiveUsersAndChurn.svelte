<script>
  import { getContext } from 'svelte';
  import { fly } from 'svelte/transition';
  import Bars from 'udgl/icons/Bars.svelte';
  import Chart from 'udgl/icons/Chart.svelte';
  import Button from 'udgl/Button.svelte';
  import ButtonGroup from 'udgl/ButtonGroup.svelte';


  import Subsection from '../Subsection.svelte';
  import Row from '../Row.svelte';
  import BigNumber from '../BigNumber.svelte';
  import ChurnChart from '../ChurnChart.svelte';
  import LineChart from '../LineChart.svelte';

  import { formats, dmy } from '../../utils/formatters';

  const data = getContext('data');
  const markers = getContext('markers');
  const deprecationDate = new Date('2020-06-22');


  let whichView = 'CHURN';

  const get = (o, k) => o.map((oi) => oi[k]);

  const positives = [
    {
      key: 'estReturning',
      label: 'Est. Returning',
      sublabel: 'F2F',
      description: 'A returning user was present in the previous period and is present in the current period.  The user was established during the previous period.',
      color: 'var(--digital-blue-500)',
      areaColor: 'var(--digital-blue-400)',
    },
    {
      key: 'newReturning',
      label: 'New Returning',
      sublabel: 'F2F',
      description: 'A returning user was present in the previous period and is present in the current period.  The user was new during the previous period.',
      color: 'var(--digital-blue-400)',
      areaColor: 'var(--digital-blue-300)',
    },
    {
      key: 'newUsers',
      label: 'New Users',
      sublabel: 'F2F',
      description: 'A new user was acquired during the current period.',
      color: 'var(--digital-blue-300)',
      areaColor: 'var(--digital-blue-200)',
    },
    {
      key: 'resurrected',
      label: 'Resurrected Users',
      sublabel: 'F2F',
      description: 'A resurrected user was not present for the previous period and is present in the current period.  They are always established.',
      color: 'orange',
      areaColor: '#fed8b1',
    },
  ];

  const negatives = [
    {
      key: 'estChurn',
      label: 'Churned Established',
      sublabel: 'F2F',
      description: 'A churned user was present in the previous period and is absent in the current period.  The user was established during the previous period.',
      color: 'var(--pantone-red-500)',
      areaColor: 'var(--pantone-red-400)',
    },
    {
      key: 'newChurn',
      label: 'Churned New',
      sublabel: 'F2F',
      description: 'A churned user was present for the previous period and is absent in the current period. The user was new during the previous period.',
      color: 'var(--pantone-red-400)',
      areaColor: 'var(--pantone-red-300)',
    },
  ];

  const fennecActives = [
    {
      key: 'fennecRemain',
      sublabel: 'Fennec',
      label: 'Remaining',
      description: 'description',
      color: 'var(--pond-green-400)',
    },
  ];

  const fennecGone = [
    {
      key: 'fennecTransition',
      label: 'Migrated Clients',
      sublabel: 'Fennec',
      description: 'description',
      color: 'var(--digital-blue-400)',
    },
    {
      key: 'fennecChurn',
      label: 'Churned',
      sublabel: 'Fennec',
      description: 'description',
      color: 'var(--pantone-red-400)',
    },
  ];

  const KPIs = [ // MATCH COLORS
    {
      sublabel: 'F2F Migration',
      label: '% Migrated',
      value: 0.22,
      format: 'percent',
      color: undefined,
      description: 'A returning user was present in the previous period and is present in the current period.  The user was established during the previous period.',
    },
    {
      label: 'F2F Returning',
      key: 'estReturning',
      value: 15432,
      format: 'rate',
      color: 'var(--digital-blue-500)',
      description: 'A returning user was present in the previous period and is present in the current period.  The user was established during the previous period.',
    },
    {
      label: 'F2F New',
      key: 'newReturning',
      description: 'description here',
      value: 6432,
      color: 'var(--digital-blue-300)',
      format: 'rate',
    },
    {
      label: 'F2F Resurrected',
      key: 'resurrected',
      description: 'description here',
      color: 'orange',
      value: 2415, // -0.05,
      format: 'rate',
    },
  ];

  const highestValue = Math.max(...[...get(positives, 'key'), ...get(negatives, 'key'), ...get(fennecActives, 'key'), ...get(fennecGone, 'key')]
    .map((y) => Math.max(...data.map((d) => d[y]))));
  
  let hoverPoint = {};
  let focusValue = data[data.length - 1];
  let hovered = false;
  $: if (hoverPoint.date !== data[data.length - 1].date) {
    focusValue = hoverPoint;
} else {
    focusValue = data[data.length - 1];
}

  const latestDate = new Date(+data[data.length - 1].date);
  latestDate.setDate(latestDate.getDate() + 30);

  </script>

  <Subsection>
    <h3 id='active-users-and-churn'>Active Users and Churn</h3>
    <ButtonGroup>
      <Button tooltip={'all lifecycle components in one chart'} toggled={whichView === 'CHURN'} on:click={() => { whichView = 'CHURN'; }} level=medium compact><Bars size={12} />Actives / Churned</Button>
      <Button tooltip={'each lifecycle component as a separate graph'} toggled={whichView === 'SM'} on:click={() => { whichView = 'SM'; }} level=medium compact><Chart size={16} />Broken Out</Button>
    </ButtonGroup>
    <Row>
      <div class="at-a-glance at-a-glance--4c">
        {#each KPIs as {sublabel, label, value, format, color, description, key}, i}
        <BigNumber description={description}>
          <span slot=sublabel>{#if !sublabel}{dmy(focusValue.date)}{:else}{sublabel}{/if}</span>
          <span slot=label>{#if color}<span style='color:{color}'>•</span>{/if} {label}</span>
          <span slot=big-number>
              {#if key}
                {formats[format](focusValue[key])}
              {:else}
                {formats[format](value)}
              {/if}
          </span>
        </BigNumber>
      {/each}
      </div>
    </Row>
    <Row>
      {#if whichView === 'CHURN'}
        <ChurnChart 
          data={data}
          xAccessor=date
          xMax={deprecationDate}
          yPositiveAccessor={get(positives, 'key')}
          yNegativeAccessor={get(negatives, 'key')}
          yPositiveColors={get(positives, 'color')}
          yNegativeColors={get(negatives, 'color')}
          yPositiveLabels={get(positives, 'label')}
          yNegativeLabels={get(negatives, 'label')}
          markers={markers}
          title={'Active & Churned Clients'}
          subtitle={'Fennec-to-Fenix Clients'}
          description="lifecycle statistics for clients that have migrated from Fennec to Fenix"
          bind:hoverPoint
          bind:hovered
        />
        <ChurnChart 
          data={data}
          xAccessor=date
          xMax={deprecationDate}
          yPositiveAccessor={get(fennecActives, 'key')}
          yNegativeAccessor={get(fennecGone, 'key')}
          yPositiveColors={get(fennecActives, 'color')}
          yNegativeColors={get(fennecGone, 'color')}
          yPositiveLabels={get(fennecActives, 'label')}
          yNegativeLabels={get(fennecGone, 'label')}
          markers={markers}
          subtitle={'Fennec'}
          title={'Remaining Clients'}
          description="lifecycle statistics for Fennec Clients"
          bind:hoverPoint
          bind:hovered
        />
      {:else if whichView === 'SM'}
      <div class='sm-3x3'>
        {#each [...positives, ...negatives, ...fennecActives, ...fennecGone] as {key, label, sublabel, description, color}, i}
          <div in:fly={{ duration: 500, y: 5, delay: i * 100 }}>
            <LineChart
              data={data}
              yMax={highestValue}
              title={label}
              subtitle={sublabel}
              description={description}
              colors={[color]}
              xAccessor=date
              showYAxisLabels={i === 0}
              yAccessor={[key]}
              xMax={deprecationDate}
              width={300}
              height={150}
              bind:hoverPoint
              yAxisTickCount={3}
              top={32}
              left={20}
              right={20}
              size=small
              hoverPointFormat=rate
              showHoverDot={false}
            />
          </div>
        {/each}
      </div>
      {/if}
    </Row>
  </Subsection>