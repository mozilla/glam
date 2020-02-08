<script>
  import { getContext } from 'svelte';
  import Subsection from '../Subsection.svelte';
  import Row from '../Row.svelte';
  import ChurnChart from '../ChurnChart.svelte';

  const data = getContext('data');

  </script>
  
  <Subsection>
    <h3 id='active-users-and-churn'>Active Users and Churn</h3>
    <Row>
      <ChurnChart 
        data={data}
        xAccessor=date
        yAccessor={['estReturning', 'newReturning', 'newUsers', 'resurrected']}
      />
    </Row>
  </Subsection>