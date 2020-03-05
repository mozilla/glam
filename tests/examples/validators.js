const noResponseExamples = {};
noResponseExamples.hasResponse = {
  response: {},
};

noResponseExamples.noResponse = {
  response_NONE: {},
};

const noDuplicatesExamples = {};
noDuplicatesExamples.noDups = {
  response: [
    { metadata: { build_id: 'abcd' } },
    { metadata: { build_id: 'abcdefg' } },
  ],
};

noDuplicatesExamples.dups = {
  response: [
    { metadata: { build_id: 'abcd' } },
    { metadata: { build_id: 'abcd' } },
  ],
};

export { noResponseExamples, noDuplicatesExamples };
