from configurations import values
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(["GET"])
def front_end_auth_config(request):
    return Response(
        {
            "clientID": values.Value(
                environ_name="AUTH0_FRONTEND_CLIENT_ID", environ_prefix=None
            ),
            "domain": values.Value(environ_name="AUTH0_ORIGIN", environ_prefix=None),
            "audience": values.Value(
                environ_name="AUTH0_AUDIENCE_ID", environ_prefix=None
            ),
            "scope": values.Value(environ_name="AUTH0_API_SCOPE", environ_prefix=None),
        }
    )
