import createAuth0Client from '@auth0/auth0-spa-js';

let auth0 = null;

function fetchAuthConfig() {
  return fetch('__BASE_DOMAIN__/api/v1/front-end-auth-config/');
}

async function configureClient() {
  const response = await fetchAuthConfig();
  const config = await response.json();

  auth0 = await createAuth0Client({
    domain: config.domain,
    client_id: config.clientID,
    audience: config.audience,
    scope: config.scope,
  });
}

async function withToken(cb) {
  cb(await auth0.getTokenSilently());
}

export function authenticate(successCallback) {
  window.onload = async () => {
    await configureClient();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      withToken(successCallback);
    } else {
      const query = window.location.search;
      if (query.includes('code=') && query.includes('state=')) {
        await auth0.handleRedirectCallback();

        // The Auth0 tutorial[1] recommends using window.history.replaceState at
        // this point to remove the "code" and "state" query parameters. We
        // don't need to do that because Router.svelte overwrites the
        // querystring as soon as the user authenticates.
        //
        // [1] https://auth0.com/docs/quickstart/spa/vanillajs

        withToken(successCallback);
      } else {
        // Auth0 requires that the user be redirected to a true static path
        // after authentication.[1] In our case, the only true static path is
        // the root path. Everything else is handled by the client-side router.
        //
        // However, we can still record the path that the user attempted to
        // access so that we can return them to it later.
        //
        // NB: relativeURLBeforeAuth includes everything except the origin. It
        // includes the path, the query string, and the fragment. Due to an
        // apparent bug,[2] if we were to pass an absolute URL to page.redirect
        // later, it would show the Not Found page.
        //
        // [1] https://bugzilla.mozilla.org/show_bug.cgi?id=1623800#c1
        // [2] https://github.com/visionmedia/page.js/issues/559
        const relativeURLBeforeAuth = window.location.href.replace(
          window.location.origin,
          ''
        );
        sessionStorage.setItem('relativeURLBeforeAuth', relativeURLBeforeAuth);
        await auth0.loginWithRedirect({
          redirect_uri: window.location.origin,
        });
      }
    }
  };
}
