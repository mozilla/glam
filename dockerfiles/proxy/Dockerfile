ARG OPENRESTY_VERSION=1.17.8.2-4-buster-fat
FROM openresty/openresty:${OPENRESTY_VERSION}

ARG LUA_RESTY_OPENIDC_VERSION=1.7.3.1
RUN opm get zmartzone/lua-resty-openidc=${LUA_RESTY_OPENIDC_VERSION}

ENV NGINX_LISTEN=80
ENV APP_LISTEN=127.0.0.1:8000
ENV OIDC_REDIRECT_URI=/oidc/callback
ENV OIDC_LOGOUT_PATH=/logout

COPY docker-entrypoint.sh /
COPY access_by_openidc.lua /usr/local/openresty/site/lualib/resty/
COPY default.conf.template /etc/nginx/templates/

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["openresty", "-g", "daemon off;"]
