import { extractBugId } from '../src/utils/urls';

describe('extractBugId', () => {
  it('correctly finds bugzilla ids', () => {
    expect(
      extractBugId('https://bugzilla.mozilla.org/show_bug.cgi?id=123456')
    ).toEqual('bugzil.la/123456');
    expect(
      extractBugId('https://bugzilla.mozilla.org/show_bug.cgi?id=123456#c7')
    ).toEqual('bugzil.la/123456');
  });
  it('correctly finds github ids', () => {
    expect(extractBugId('https://github.com/org/project/issues/12345')).toEqual(
      'org/project#12345'
    );
    expect(
      extractBugId(
        'https://github.com/org/project/pull/12345#issuecomment-123456789'
      )
    ).toEqual('org/project#12345');
  });
  it('correctly defaults to returning the url', () => {
    expect(extractBugId('https://github.com/org/project')).toEqual(
      'https://github.com/org/project'
    );
  });
});
