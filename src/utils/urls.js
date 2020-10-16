export function extractBugId(url) {
  if (url.includes('bugzilla')) {
    const match = /id=(?<id>\d+)/.exec(url);
    if (match) {
      return `bugzil.la/${match.groups.id}`;
    }
  }
  if (url.includes('github')) {
    const regexp = /github\.com\/(?<org>[^/]+)\/(?<project>[^/]+)\/(pull|issues)\/(?<id>\d+)/;
    const match = regexp.exec(url);
    if (match) {
      return `${match.groups.org}/${match.groups.project}#${match.groups.id}`;
    }
  }
  return url;
}
