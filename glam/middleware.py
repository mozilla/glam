def dev_cors_middleware(get_response):
    """
    Adds CORS headers for local testing only to allow the frontend, which is
    served on port 3000, to access the API, which is served on port 8000.
    """

    def middleware(request):
        response = get_response(request)

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS, POST"
        response[
            "Access-Control-Allow-Headers"
        ] = "Authorization, Content-Type, X-CSRFToken"
        response["Access-Control-Max-Age"] = 60 * 60 * 24

        return response

    return middleware
