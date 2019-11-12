from server import cache


def get_token_auth_header():
    """Obtains the Access Token from the Authorization Header"""

    auth = request.headers.get("Authorization")

    if not auth:
        raise AuthError(
            {
                "code": "authorization_header_missing",
                "description": "Authorization header is expected",
            },
            403,
        )

    parts = auth.split()

    if len(parts) != 2 or parts[0] != "Bearer":
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Authorization header must be a Bearer token",
            },
            403,
        )

    # Return token.
    return parts[1]


def check_auth():
    """Determines if the Access Token is valid"""
    domain_base = "https://" + AUTH0_DOMAIN + "/"
    token = get_token_auth_header()
    cache_key = f"auth0:{token}"

    if cache_value := cache.get(cache_key):
        return cache_value

    # Check token validity
    jsonurl = urlopen(domain_base + ".well-known/jwks.json")
    jwks = json.loads(jsonurl.read())

    try:
        unverified_header = jwt.get_unverified_header(token)
    except JWTError:
        raise AuthError(
            {"code": "improper_token", "description": "Token cannot be validated"}, 403
        )

    rsa_key = {}
    for key in jwks["keys"]:
        if key["kid"] == unverified_header["kid"]:
            rsa_key = {
                "kty": key["kty"],
                "kid": key["kid"],
                "use": key["use"],
                "n": key["n"],
                "e": key["e"],
            }
            break
    else:
        raise AuthError(
            {"code": "invalid_header", "description": "Unable to find appropriate key"},
            403,
        )

    try:
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=AUTH0_ALGORITHMS,
            audience=AUTH0_API_AUDIENCE,
            issuer=domain_base,
        )
    except jwt.ExpiredSignatureError:
        raise AuthError(
            {"code": "token_expired", "description": "Token is expired"}, 403
        )
    except jwt.JWTClaimsError:
        raise AuthError(
            {
                "code": "invalid_claims",
                "description": "Incorrect claims, please check the audience and issuer",
            },
            403,
        )
    except Exception:
        raise AuthError(
            {
                "code": "invalid_header",
                "description": "Unable to parse authentication token",
            },
            403,
        )

    # check scope
    unverified_claims = jwt.get_unverified_claims(token)
    if unverified_claims.get("scope"):
        token_scopes = unverified_claims["scope"].split()
        for token_scope in token_scopes:
            if token_scope == AUTH0_REQUIRED_SCOPE:
                _request_ctx_stack.top.current_user = payload
                cache.set(cache_key, True)
                return True

    raise AuthError({"code": "access_denied", "description": "Access not allowed"}, 403)


def is_authenticated():
    try:
        return check_auth()
    except AuthError:
        return False
