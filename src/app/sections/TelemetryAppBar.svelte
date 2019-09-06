<script>
import Header from '../../components/sections/Header.svelte';
import Button from '../../components/Button.svelte';
</script>

<style>

div {
    opacity:.6;
}

div:hover {
    opacity: 1;
}

</style>

<Header>
    <h1>Telemetry<sub>v2</sub></h1>
    <div>
        <Button pale compact dark level='low'>go to docs</Button>
    </div>
</Header>