import { gatherBy } from '../probe-utils';
import GCMS_BUILD_ID from '../../../tests/data/gc_ms_build_id.json';

const gcmsBuild = GCMS_BUILD_ID.response;

describe('gatherBy', () => {
  it('gathers by client agg type', () => {
    const out = gatherBy(gcmsBuild, (entry) => entry.client_agg_type);
  });
});
