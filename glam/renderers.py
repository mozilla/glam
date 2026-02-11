"""Project-specific renderer tweaks.

The upstream ``drf-orjson-renderer`` 1.4.0+ changed behaviour when
``data`` is ``None``: ``render`` now returns ``None`` instead of an
empty byte string.  Django's ``HttpResponse`` expects renderers to
return a byte/string payload; passing ``None`` ends up in a ``''.join``
call inside Django which triggers ``TypeError: sequence item 0:
expected str instance, NoneType found``.  CI started hitting this after
upgrading the dependency, so we wrap the renderer to restore the
previous behaviour (return ``b""``) and keep the rest of the upstream
implementation intact.
"""

from drf_orjson_renderer.renderers import ORJSONRenderer as _ORJSONRenderer


class ORJSONRenderer(_ORJSONRenderer):
    """DRF renderer that normalises ``None`` responses to ``b""``.

    Older versions of ``drf-orjson-renderer`` returned ``b""`` when the
    response ``data`` was ``None``.  When ``None`` is propagated to
    ``HttpResponse`` Django tries to ``join`` it with other parts of the
    content list, raising a ``TypeError``.  Explicitly coerce ``None``
    back to an empty byte string before delegating to the upstream
    implementation.
    """

    # Explicitly set these in case the upstream defaults change.
    media_type = "application/json"
    format = "json"
    charset = "utf-8"

    def render(self, data, media_type=None, renderer_context=None):
        if data is None:
            return b""
        rendered = super().render(
            data, media_type=media_type, renderer_context=renderer_context
        )
        return b"" if rendered is None else rendered
