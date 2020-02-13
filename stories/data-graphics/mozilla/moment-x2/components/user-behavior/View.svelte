<script>
  import { setContext } from 'svelte';
  
  import Summary from './Summary.svelte';
  import ActivityDetails from './ActivityDetails.svelte';
  import ActivityInteractionsDetails from './ActivityInteractionsDetails.svelte';
  import ActivityMenuDetails from './ActivityMenuDetails.svelte';
  import ActivityPlatformDetails from './ActivityPlatformDetails.svelte';
  
  const markers = [
    { location: new Date('2020-02-18'), label: 'beta' },
    { location: new Date('2020-04-07'), label: 'launch' },
    { location: new Date('2020-06-10'), label: 'Toronto' },
  ];
  
  let dates = (n = 40) => {
    let dt = new Date('2020-02-07');
    return Array.from({ length: n }).fill(null).map((_, i) => {
      let dt2 = new Date(dt);
      dt.setDate(dt.getDate() + 1);
      return dt2;
    });
  };

  const engage = (segment, amts) => {
    const out = {};
    Object.keys(amts).map((k) => {
      const s = amts[k];
      out[`${segment}_${k}`] = s;
    });
    return out;
  };

  const features = ['page', 'account', 'link_management', 'setting', 'search', 'media', 'uri', 'issue', 'context'];

  const f2fEngage = engage('f2f', {
    page: 0.27,
    account: 0.08,
    link_management: 0.065,
    custom_tab: 0.06,
    setting: 0.055,
    search: 0.05,
    media: 0.075,
    uri: 0.04,
    issue: 0.035,
    context: 0.03,
  });

  const otherEngage = engage('other', {
    page: 0.26,
    account: 0.085,
    link_management: 0.06,
    custom_tab: 0.065,
    setting: 0.08,
    search: 0.055,
    media: 0.04,
    uri: 0.045,
    issue: 0.03,
    context: 0.05,
  });
  
  
  const metricData = dates().map((date) => {
    Object.keys(f2fEngage).forEach((k) => {
      f2fEngage[k] += (Math.random() - 0.495) * 0.005;
    });
    Object.keys(otherEngage).forEach((k) => {
      otherEngage[k] += (Math.random() - 0.495) * 0.005;
    });
    return {
      date,
      ...f2fEngage,
      ...otherEngage,
    };
  });
  setContext('data', metricData);
  setContext('engagementFeatures', features);
  setContext('markers', markers);
  
  </script>
  
  <h2>User Behavior</h2>
  
  <Summary />
  <ActivityDetails />
  <ActivityInteractionsDetails />
  <ActivityMenuDetails />
  <ActivityPlatformDetails />