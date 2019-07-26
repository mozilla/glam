<script>
    import { onMount } from 'svelte';

    export let data;

    function drawChart(data) {
        var chart = document.createElement('div');
        document.getElementById('charts').appendChild(chart);
        Plotly.plot(
            chart,
            [
                {
                    type: 'scatter',
                    x: data.aggregates.map(d => d.key),
                    y: data.aggregates.map(d => d.value),
                }
            ]
        );
    }

    onMount(() => {
        console.log(data);
        drawChart(data);
    });
</script>
