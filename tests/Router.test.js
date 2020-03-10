import { getPath } from '../src/routing/Router.svelte';


describe('getPath', () => {
  it('Returns the correct path', () => {
    expect(getPath('/a/b/c')).toEqual('/a/b/c');
    expect(getPath('/a/b/c', 'x=1&y=2&z=3')).toEqual('/a/b/c?x=1&y=2&z=3');
  });

  it('Does not include a query when the second argument is undefined', () => {
    expect(getPath('/a/b/c', undefined)).toEqual('/a/b/c');
  });

  it('Does not include a query when the second argument is null', () => {
    expect(getPath('/a/b/c', null)).toEqual('/a/b/c');
  });
});
