import createAuth0Client from '@auth0/auth0-spa-js';

import { codeAndStateInQuery } from './url';

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

async function kickOffAuthentication() {
  // Auth0 requires that the user be redirected to a true static path
  // after authentication.[1] In our case, the only true static path is
  // the root path. Everything else is handled by the client-side router.
  //
  // However, we can still record the path that the user attempted to
  // access so that we can return them to it after they authenticate.
  //
  // [1] https://bugzilla.mozilla.org/show_bug.cgi?id=1623800#c1
  sessionStorage.setItem('realAuthRedirectTarget', window.location.href);
  await auth0.loginWithRedirect({
    redirect_uri: window.location.origin,
  });
}

async function wrapUpAuthentication() {
  await auth0.handleRedirectCallback();
  const realAuthRedirectTarget = sessionStorage.getItem(
    'realAuthRedirectTarget'
  );
  sessionStorage.removeItem('realAuthRedirectTarget');

  // It's important to use window.location.replace here rather than
  // window.history.replaceState or window.history.pushState because we
  // want the app to load from scratch once the user arrives at the target
  // path. That way, the store will be initialized based on the target
  // path.
  //
  // Using window.location.replace also ensures that the homepage does not
  // appear in the user's history between auth0.com and the target path.
  if (window.location.href !== realAuthRedirectTarget) {
    window.location.replace(realAuthRedirectTarget);
  }
}

export function authenticate(successCallback) {
  window.onload = async () => {
    await configureClient();

    const isAuthenticated = await auth0.isAuthenticated();

    if (isAuthenticated) {
      withToken(successCallback);
    } else if (!isAuthenticated && !codeAndStateInQuery()) {
      kickOffAuthentication();
    } else if (!isAuthenticated && codeAndStateInQuery()) {
      wrapUpAuthentication();
    }
  };
}
