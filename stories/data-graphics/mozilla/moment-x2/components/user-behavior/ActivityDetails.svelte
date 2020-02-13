<script>
  import { getContext } from 'svelte';
  import Marker from 'udgl/data-graphics/guides/Marker.svelte';
  import Subsection from '../Subsection.svelte';
  import Row from '../Row.svelte';
  import LineChart from '../LineChart.svelte';
  
  const data = getContext('data');
  const markers = getContext('markers');
  const deprecationDate = new Date('2020-06-22');
  const features = getContext('engagementFeatures');
  let hoverPoint = {};
  </script>
  
  <Subsection>
    <h3>Feature Engagement</h3>
    <Row>
      <div class="sm-3x3">
      {#each features as feature, i}
        <LineChart
          width={300}
          height={175}
          size=small
          title={feature.replace('_', ' ')}
          data={data}
          yMax={0.5}
          left={32}
          right={5}
          top={32}
          bottom={20}
          xAccessor=date
          yFormat=percent
          hoverPointFormat=percent2d
          showYAxisLabels={i === 0}
          xMax={deprecationDate}
          yAccessor={[`f2f_${feature}`, `other_${feature}`]}
          colors={['var(--pantone-red-400)', 'var(--digital-blue-500)']}
          labels={['f2f', 'other']}
          markers={markers}
          bind:hoverPoint
        />
      {/each}
      </div>
    </Row>
    
  </Subsection>