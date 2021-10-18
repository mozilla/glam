export function getBugURL(ref) {
  // handle old-style Glean bug references
  // copied from the Glean Dictionary
  return ref.toString().startsWith('http')
    ? ref
    : `https://bugzilla.mozilla.org/show_bug.cgi?id=${ref}`;
}

export function getBugLinkTitle(ref) {
  // return a shortened URL for bugzilla and github URLs.
  // also copied from the Glean Dictionary
  const url = getBugURL(ref);

  // bugzilla bugs
  if (url.includes('bugzilla.mozilla.org') || url.includes('bugzil.la')) {
    return url.replace(/([^\d]+)/, 'bugzil.la/');
  }
  // github issues or pull requests
  if (url.includes('github.com')) {
    return url
      .replace(
        /[^\d]+\/([^\d]+)\/([^\d]+)\/[^\d]+\/([\d]+)/,
        (_, orgName, repoName, issueNumber) =>
          `${orgName}/${repoName}#${issueNumber}`
      )
      .replace(/#issuecomment.*/, '-comment');
  }
  // some other hitherto unseen issue URL, we'll just return
  // it verbatim, just remove the http/https part
  return url.replace(/^http(s?):\/\//, '');
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
