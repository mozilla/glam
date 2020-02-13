import { storiesOf } from '@storybook/svelte';
import MomentX from './MomentX.svelte';
// import ReleaseHealthDashboard from './ReleaseHealthDashboard.svelte';
import '../../../../public/static/global.css';
import '../../../glean-design-stories.css';
import './style.css';

storiesOf('Moment X', module)
  .add('Dashboard', () => ({
    Component: MomentX,
  }));
/*
  .add('Release Health Dashboard', () => ({
    Component: ReleaseHealthDashboard,
  }));
  */
