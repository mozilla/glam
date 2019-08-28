<script>
import { DATA, serverParams } from './store'

let chart;

$: renderChart($DATA);

function renderChart(data) {
    if (!data || !chart) return;

    // create new chart on the fly.
    Plotly.purge(chart);
    Plotly.plot(
        chart, [
            {
                type: 'scatter',
                x: Object.keys(data),
                y: Object.values(data)
            }
        ]
    );
}

</script>

<div bind:this={chart}></div>

<p>
    Query using metric={$serverParams.metric}, channel={$serverParams.channel}, version={$serverParams.version}.
</p>
