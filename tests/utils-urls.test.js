import { getBugLinkTitle } from '../src/utils/urls';

describe('Titles for bugzilla URLs', () => {
  it('works as expected', () => {
    expect(getBugLinkTitle('https://bugzilla.mozilla.org/1234')).toEqual(
      'bugzil.la/1234'
    );
    expect(getBugLinkTitle('https://bugzilla.mozilla.org/1234#c23')).toEqual(
      'bugzil.la/1234#c23'
    );
    expect(getBugLinkTitle('https://bugzil.la/1234')).toEqual('bugzil.la/1234');
    expect(getBugLinkTitle('https://bugzil.la/show_bug.cgi?id=1234')).toEqual(
      'bugzil.la/1234'
    );
  });
});

describe('Titles for github URLs', () => {
  it('works as expected', () => {
    expect(
      getBugLinkTitle('https://github.com/mozilla-mobile/fenix/issues/1234')
    ).toEqual('mozilla-mobile/fenix#1234');
    expect(
      getBugLinkTitle(
        'https://github.com/mozilla-mobile/fenix/issues/1234#issuecomment-5678'
      )
    ).toEqual('mozilla-mobile/fenix#1234-comment');
  });
});

describe('Titles for other issue tracker URLs', () => {
  it('correctly defaults to returning the url without https://', () => {
    expect(getBugLinkTitle('https://jira.com/1234')).toEqual('jira.com/1234');
  });
});
