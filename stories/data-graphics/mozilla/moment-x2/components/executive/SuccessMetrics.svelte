<script>
  import { getContext } from 'svelte';
  import Marker from 'udgl/data-graphics/guides/Marker.svelte';
  import Subsection from '../Subsection.svelte';
  import LineChart from '../LineChart.svelte';
  import { productColors } from '../../utils/color';

  const data = getContext('data');
  const markers = getContext('markers');
  const deprecationDate = new Date('2020-06-22');
  
  </script>
  
  <Subsection>
    <h3>Success Metrics</h3>
    <LineChart
      width={1104}
      title="Difference in Retention"
      subtitle="Fenix - Fennec 1 Year Ago"
      description={`we do not want to directly compare Fennec and Fenix retention rates as the migration happens. 
        Instead, our retention success metric will compare Established Fennec users from 1 year ago to retention for F2F Fenix Users. 
        We also want to ensure that seasonal changes in retention are not driving changes in our success metric. 
        By comparing retention today and one week ago today we are accounting for day of week effects. 
        Comparing this metric year over year helps us account for annual seasonality. We want to keep this number above -20%.  
      `}
      data={data}
      xAccessor=date
      yFormat=ratio
      yMin={-1.5}
      yMax={1.5}
      xMax={deprecationDate}
      yAccessor={['successMetric']}
      labels={['Fennec', 'F2F', 'Fenix']}
      colors={[productColors.f2f, productColors.fennec, productColors.fenix]}
      markers={markers}
    >
      <g slot=annotation>
        <Marker description="hey hey hey!" color=var(--pantone-red-600) animate={false} lineThickness={2} dasharray='1,0' direction=horizontal location={-0.2}>Baseline</Marker>
      </g>
    </LineChart>
  </Subsection>