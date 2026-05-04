import ctypes
import gc
import logging

logger = logging.getLogger(__name__)

try:
    _libc = ctypes.CDLL("libc.so.6")
    _malloc_trim = _libc.malloc_trim
    _malloc_trim.argtypes = [ctypes.c_size_t]
    _malloc_trim.restype = ctypes.c_int
except (OSError, AttributeError):
    # libc.so.6 / malloc_trim isn't available on macOS or musl-based images.
    # Trimming becomes a no-op there; the middleware stays installed but
    # only the gc.collect() runs.
    _malloc_trim = None
    logger.info("malloc_trim unavailable; release middleware will only run gc.collect()")


def release_memory_middleware(get_response):
    """Return freed heap to the OS after each response.

    Heavy responses (e.g. labeled-counter aggregates that build ~180 MB of
    Python objects plus a similarly sized encoded payload) leave glibc holding
    onto a large chunk of trimmed-but-unreturned heap. The next request lands
    in a process whose RSS already sits near its limit and OOM-kills the pod.

    We force a gc cycle and then ask glibc to release unused heap as soon as
    the response is sent.
    """

    def middleware(request):
        response = get_response(request)
        gc.collect()
        if _malloc_trim is not None:
            _malloc_trim(0)
        return response

    return middleware


def dev_cors_middleware(get_response):
    """
    Adds CORS headers for local testing only to allow the frontend, which is
    served on port 3000, to access the API, which is served on port 8000.
    """

    def middleware(request):
        response = get_response(request)

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET, HEAD, OPTIONS, POST"
        response["Access-Control-Allow-Headers"] = (
            "Authorization, Content-Type, X-CSRFToken"
        )
        response["Access-Control-Max-Age"] = 60 * 60 * 24

        return response

    return middleware
