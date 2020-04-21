export function codeAndStateInQuery() {
  return (
    window.location.search.includes('code=') &&
    window.location.search.includes('state=')
  );
}
