import { noDuplicates, noResponse, validate } from '../src/utils/data-validation';

const noResponseCases = {};
noResponseCases.hasResponse = {
  response: {},
};

noResponseCases.noResponse = {
  response_NONE: {},
};

const noDupsData = {};
noDupsData.noDups = {
  response: [
    { metadata: { build_id: 'abcd' } },
    { metadata: { build_id: 'abcdefg' } },
  ],
};

noDupsData.dups = {
  response: [
    { metadata: { build_id: 'abcd' } },
    { metadata: { build_id: 'abcd' } },
  ],
};


describe('noResponse', () => {
  it('passes if there is a response key', () => {
    expect(() => noResponse(noResponseCases.hasResponse)).not.toThrow();
    expect(() => noResponse(noResponseCases.noResponse)).toThrow();
  });
});

describe('noDuplicates', () => {
  it('passes or rejects depending on if there are duplicate keys (build_ids, versions)', () => {
    expect(() => noDuplicates(noDupsData.noDups, 'build_id')).not.toThrow();
    expect(() => noDuplicates(noDupsData.dups, 'build_id')).toThrow();
  });
});
