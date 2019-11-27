import json

import requests
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from django.utils.encoding import force_bytes, smart_text
from josepy.errors import DeserializationError
from josepy.jwk import JWK
from josepy.jws import JWS, Header
from rest_framework import authentication, exceptions


JWKS = None


def get_jwks():
    global JWKS

    if JWKS is None:
        response_jwks = requests.get(settings.OIDC_OP_JWKS_ENDPOINT, verify=True)
        response_jwks.raise_for_status()
        JWKS = response_jwks.json()

    return JWKS


class OIDCTokenAuthentication(authentication.BaseAuthentication):

    www_authenticate_realm = "api"

    def authenticate(self, request):
        token = self.get_access_token(request)

        if token:
            payload = self.verify_token(token)
            if payload:
                return (TokenUser, {"scope": "read:foo"})

        return (AnonymousUser(), {"scope": None})

    def authenticate_header(self, request):
        return 'Bearer realm="{}"'.format(self.www_authenticate_realm)

    def get_access_token(self, request):
        """
        Get the access token based on a request.

        Returns `None` if no authentication details were provided.
        Raises `AuthenticationFailed` if the token is incorrect.
        """
        header = authentication.get_authorization_header(request)
        if not header:
            return None
        header = header.decode(authentication.HTTP_HEADER_ENCODING)

        auth = header.split()

        if auth[0].lower() != "bearer":
            return None

        if len(auth) == 1:
            raise exceptions.AuthenticationFailed(
                "Invalid 'bearer' header: No credentials provided."
            )
        elif len(auth) > 2:
            raise exceptions.AuthenticationFailed(
                "Invalid 'bearer' header: Credentials string should not contain spaces."
            )

        return auth[1]

    def retrieve_matching_jwk(self, token):
        """Get the signing key by exploring the JWKS endpoint of the OP."""
        jwks = get_jwks()

        # Compute the current header from the given token to find a match
        try:
            jws = JWS.from_compact(token)
        except DeserializationError as e:
            raise exceptions.AuthenticationFailed(e)

        json_header = jws.signature.protected
        header = Header.json_loads(json_header)

        key = None
        for jwk in jwks["keys"]:
            if jwk["kid"] != smart_text(header.kid):
                continue
            if "alg" in jwk and jwk["alg"] != smart_text(header.alg):
                raise exceptions.AuthenticationFailed("alg values do not match.")
            key = jwk
        if key is None:
            raise exceptions.AuthenticationFailed("Could not find a valid JWKS.")
        return key

    def _verify_jws(self, payload, key):
        """Verify the given JWS payload with the given key and return the payload"""
        jws = JWS.from_compact(payload)

        try:
            alg = jws.signature.combined.alg.name
        except KeyError:
            raise exceptions.AuthenticationFailed("No alg value found in header")

        if alg != settings.OIDC_RP_SIGN_ALGO:
            raise exceptions.AuthenticationFailed(
                "The provider algorithm {!r} does not match the client's "
                "OIDC_RP_SIGN_ALGO.".format(alg)
            )

        jwk = JWK.from_json(key)

        if not jws.verify(jwk):
            raise exceptions.AuthenticationFailed("JWS token verification failed.")

        return jws.payload

    def verify_token(self, token):
        token = force_bytes(token)
        key = self.retrieve_matching_jwk(token)
        payload_data = self._verify_jws(token, key)
        payload = json.loads(payload_data.decode("utf-8"))

        return payload


class TokenUser(AnonymousUser):
    @property
    def is_anonymous(self):
        return False

    @property
    def is_authenticated(self):
        return True
