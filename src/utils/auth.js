/* eslint-disable import/prefer-default-export */

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
        window.history.replaceState({}, document.title, '/');
        withToken(successCallback);
      } else {
        await auth0.loginWithRedirect({
          redirect_uri: window.location.origin,
        });
      }
    }
  };
}
