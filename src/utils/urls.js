// Return a shortened URL for bugzilla and github URLs.
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

// Given an object of query params, return the object stripped of query
// parameters that are set to their default values.
export function stripDefaultValues(params, defaults) {
  return Object.keys(params)
    .filter((k) => {
      // If it's empty or undefined, remove it.
      if (!params[k]) return false;
      if (Object.keys(defaults).includes(k)) {
        // If this param has a default value defined.
        if (defaults[k].isMulti) {
          // If it has multiple values, use JSON.stringify for an easy
          // equality check since these are arrays.
          return (
            JSON.stringify(params[k]) !==
            JSON.stringify(defaults[k].defaultValue)
          );
        }
        // It's not `isMulti`, so just compare value to value.
        return params[k] !== defaults[k].defaultValue;
      }
      // If no default defined, return true to include it in the URL.
      return true;
    })
    .reduce(
      (obj, k) => ({
        ...obj,
        [k]: params[k],
      }),
      {}
    );
}
