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
  <h3>Growth Metrics</h3>
  <LineChart
    width={1104}
    title="Change Ratio"
    subtitle="(new + resurrected) / churned"
    description="A change ratio helps us understand whether a product is growing or shrinking period over period. change ratio = (new+resurrected) / churned"
    data={data}
    xAccessor=date
    yFormat=ratio
    yMax={2}
    xMax={deprecationDate}
    yAccessor={['fennecChangeRatio', 'f2fChangeRatio', 'fenixChangeRatio']}
    labels={['Fennec', 'F2F', 'Fenix']}
    colors={[productColors.f2f, productColors.fennec, productColors.fenix]}
    markers={markers}
  >
    <g slot=annotations>
      <Marker orientation=horizontal location={1}>no-growth line</Marker>
    </g>
  </LineChart>
</Subsection>