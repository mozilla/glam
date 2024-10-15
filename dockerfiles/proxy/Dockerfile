ARG OPENRESTY_VERSION=1.21.4.1-0-bullseye-fat
FROM openresty/openresty:${OPENRESTY_VERSION}

ARG LUA_RESTY_OPENIDC_VERSION=1.7.4
RUN opm get zmartzone/lua-resty-openidc=${LUA_RESTY_OPENIDC_VERSION}

ENV NGINX_LISTEN=80
ENV APP_LISTEN=127.0.0.1:8000
ENV OIDC_REDIRECT_URI=/oidc/callback
ENV OIDC_LOGOUT_PATH=/logout
ENV NGINX_SESSION_STORAGE=cookie
ENV NGINX_SESSION_REDIS_HOST=127.0.0.1
ENV NGINX_SESSION_REDIS_PORT=6379

COPY docker-entrypoint.sh /
COPY access_by_openidc.lua /usr/local/openresty/site/lualib/resty/
COPY default.conf.template /etc/nginx/templates/

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["openresty", "-g", "daemon off;"]
