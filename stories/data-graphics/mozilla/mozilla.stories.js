import { storiesOf } from '@storybook/svelte';

import UsageMetricsDashboard from './UsageMetricsDashboard.svelte';
import ReleaseHealthDashboard from './ReleaseHealthDashboard.svelte';
import '../../../public/static/global.css';
import '../../glean-design-stories.css';

storiesOf('Data Graphics|Mozilla Layout Examples', module)
  .add('Usage Metrics Dashboard', () => ({
    Component: UsageMetricsDashboard,
  }))
  .add('Release Health Dashboard', () => ({
    Component: ReleaseHealthDashboard,
  }));
