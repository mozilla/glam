<script>
  import { queryData } from "./firebase";
  import { Form, FormGroup } from "sveltestrap";
  import Navigation from "./Navigation.svelte";
  import Selector from "./Selector.svelte";
  import Chart from "./Chart.svelte";
  import STORE, { DATA, dispatch, options, changeMetric, changeVersion, changeChannel, queryString, serverParams } from "./store";

  function updateQueryString(value) {
    if (history.pushState) {
      const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + value;
      window.history.pushState({ path: newurl }, "", newurl);
    }
  }
  $: updateQueryString($queryString);

  $: queryData($serverParams, DATA);

</script>

<div className="App">
  <Navigation />

  <Form>
    <FormGroup>
      <!-- Lots of boiler plate here. Any way to make this better? -->
      <Selector formId="metric" label={'Select Metric:'} current={$STORE.metric} onChange={metric => dispatch(changeMetric(metric))} options={options.metric} />
      <Selector formId="channel" label={'Select Channel:'} current={$STORE.channel} onChange={channel => dispatch(changeChannel(channel))} options={options.channel} />
      <Selector formId="version" label={'Select Version:'} current={$STORE.version} onChange={version => dispatch(changeVersion(version))} options={options.version} />
    </FormGroup>
  </Form>

  <Chart />

</div>
