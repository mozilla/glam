<script>
    import { db } from './firebase';
    import Chart from './Chart.svelte';

    let promise = db
        .collection('release-65')
        .doc('02415bbe9515d8c1da5cfa072c0b79c9')
        .get()
        .then(doc => {
            console.log(`Queried document: ${doc.id}`);
            console.log(doc.data());
            //return (doc.exists ? doc.data() : "Data not found.");
            return doc.data();
        })
        .catch(error => {
            console.log(error);
            throw(error);
        });

    let dummyData = {
        aggregates: [
            {key:1, value:2},
            {key:2, value:4},
            {key:3, value:8},
        ]
    };
</script>

{#await promise}
    <p>Querying data...</p>
{:then data}
    <div id="charts"></div>
    <Chart {data} />
    <Chart data={dummyData} />
{:catch error}
    <p>{error.message}</p>
{/await}
