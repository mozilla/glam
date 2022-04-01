import FirefoxLegacyDetails from '../routing/pages/probe/FirefoxLegacyDetails.svelte';
import GleanDetails from '../routing/pages/probe/GleanDetails.svelte';

export default {
  legacy: {
    details: FirefoxLegacyDetails,
  },
  fog: {
    details: GleanDetails,
  },
  fenix: {
    details: GleanDetails,
  },
};
