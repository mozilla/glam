import FirefoxLegacyDetails from '../routing/pages/probe/FirefoxLegacyDetails.svelte';
import GleanDetails from '../routing/pages/probe/GleanDetails.svelte';

export default {
  firefox: {
    details: FirefoxLegacyDetails,
  },
  fog: {
    details: GleanDetails,
  },
  fenix: {
    details: GleanDetails,
  },
};
