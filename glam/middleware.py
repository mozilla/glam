from django.contrib.auth.models import User


def dev_cors_middleware(get_response):
    """
    Adds CORS headers for local testing only to allow the frontend, which is
    served on port 5000, to access the API, which is served on port 8000.
    """

    def middleware(request):
        response = get_response(request)

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS, POST"
        response["Access-Control-Allow-Headers"] = (
            "Authorization, Content-Type, X-CSRFToken")
        response["Access-Control-Max-Age"] = 60 * 60 * 24

        return response

    return middleware


def auth0_user(get_response):

    def middleware(request):
        if True or "REMOTE_USER" in request.headers:
            remote_user = request.headers.get("REMOTE_USER", "coder@mozilla.com")
            try:
                user = User.objects.get(username=remote_user)
            except User.DoesNotExist:
                user = User.objects.create_user(username=remote_user)

            # Note: We are saving this as `request.remote_user` instead of
            # `request.user` so Django doesn't assume we have a traditional
            # Django auth flow.
            #
            # In the views we can access `request.remote_user.id` for assigning
            # data to a `User`.
            request.remote_user = user

        response = get_response(request)
        return response

    return middleware
