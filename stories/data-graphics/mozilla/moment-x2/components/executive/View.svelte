<script>
import { setContext } from 'svelte';

import ToplineKPIs from './ToplineKPIs.svelte';
import ActiveUsersAndChurn from './ActiveUsersAndChurn.svelte';
import FennecToFenixRetention from './FennecToFenixRetention.svelte';
import SuccessMetrics from './SuccessMetrics.svelte';
import GrowthMetrics from './GrowthMetrics.svelte';

import retentionData from '../../retention';

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

let M = (Math.random() * 10);
let dau = 1000000 * M;
let wau = dau * 2;
let mau = dau * 3.5;
let usage = 2.5;
let r01 = 0.8;
let r02 = 0.7;

let estReturning = 5000;
let newUsers = 1000;
let newReturning = 1000;
let newChurn = 1000;
let estChurn = 1000;
let resurrected = 1000;

let fennecRemain = 10000;
let fennecChurn = 1000;
let fennecTransition = 1000;

let fennecToFenixRetention = 0.8;
let fennecEstablishedRetention = 0.72;
let fenixEstablishedRetention = 0.70;
let successMetric = 0.5;

let fennecChangeRatio = 1;
let f2fChangeRatio = 0.85;
let fenixChangeRatio = 0.8;

const metricData = dates().map((date) => {
  dau += (Math.random() - 0.45) * 100000 * M;
  wau += (Math.random() - 0.45) * 50000 * M;
  mau += (Math.random() - 0.45) * 50000 * M;

  estReturning += (Math.random() - 0.45) * 300;
  newUsers += (Math.random() - 0.3) * 100;
  newReturning += (Math.random() - 0.5) * 10;

  fennecRemain += (Math.random() - 0.60) * 500;
  fennecChurn += (Math.random() - 0.5) * 10;
  fennecTransition += (Math.random() - 0.40) * 500;

  fennecToFenixRetention += (Math.random() - 0.5) * 0.02;
  fennecEstablishedRetention += (Math.random() - 0.5) * 0.02;
  fenixEstablishedRetention += (Math.random() - 0.5) * 0.04;

  f2fChangeRatio += (Math.random() - 0.5) * 0.01;
  fennecChangeRatio += (Math.random() - 0.55) * 0.01;
  fenixChangeRatio += (Math.random() - 0.499) * 0.01;

  successMetric += (Math.random() - 0.6) * 0.05;

  const r = Math.random();
  if (r < 0.005) {
    r01 += (Math.random() - 0.6) * 0.1;
  }
  return {
    date,
    dau,
    wau,
    mau,
    fennecToFenixRetention,
    fennecEstablishedRetention,
    fenixEstablishedRetention,
    f2fChangeRatio,
    fennecChangeRatio,
    fenixChangeRatio,
    estReturning,
    newUsers,
    newReturning,
    newChurn: newChurn + (Math.random() - 0.5) * 100,
    estChurn: estChurn + (Math.random() - 0.5) * 100,
    resurrected: resurrected + (Math.random() - 0.5) * 100,
    fennecRemain,
    fennecChurn,
    fennecTransition,
    successMetric,
  };
});

setContext('data', metricData);
setContext('dataset', retentionData);
setContext('markers', markers);

</script>

<h2>Executive Summary</h2>

<ToplineKPIs />
<ActiveUsersAndChurn />
<FennecToFenixRetention />
<SuccessMetrics />
<GrowthMetrics />
