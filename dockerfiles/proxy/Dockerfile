ARG OPENRESTY_VERSION=1.19.3.1-4-buster-fat
FROM openresty/openresty:${OPENRESTY_VERSION}

ARG LUA_RESTY_OPENIDC_VERSION=1.7.4
RUN opm get zmartzone/lua-resty-openidc=${LUA_RESTY_OPENIDC_VERSION}

ARG ENVSUBST_VERSION=1.2.0
ARG ENVSUBST_CHECKSUM=e1338a997e354736a83611933b0e8096036b85f54317832c8a0d99e189fbc901

RUN set -eux; \
  curl -sL https://github.com/a8m/envsubst/releases/download/v${ENVSUBST_VERSION}/envsubst-Linux-x86_64 -o /usr/local/bin/envsubst; \
  echo "${ENVSUBST_CHECKSUM} /usr/local/bin/envsubst" | sha256sum -c; \
  chmod +x /usr/local/bin/envsubst

ENV NGINX_LISTEN=80
ENV APP_LISTEN=127.0.0.1:8000
ENV OIDC_REDIRECT_URI=/oidc/callback
ENV OIDC_LOGOUT_PATH=/logout

COPY docker-entrypoint.sh /
COPY access_by_openidc.lua /usr/local/openresty/site/lualib/resty/
COPY default.conf.template /etc/nginx/templates/

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["openresty", "-g", "daemon off;"]
