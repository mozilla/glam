# Authentication against Auth0 via nginx proxy

- Status: accepted
- Deciders: Rob Hudson, Hamilton Ulmer, Rob Miller
- Date: 2020-09-01

## Context and Problem Statement

GLAM requires authentication to protect sensitive metrics, make some metrics and
views visible to non-Mozillians, and in the future to potentially add
user-oriented features. Currently we handle the authentication in the app layer,
albeit with some issues. This ADR attempts to resolve these issues.

## Decision Drivers

- Authentication should work without issue, including infinite redirects or
  conflicts with enhanced tracking protection and 3rd party cookies.
- Authentication should allow some areas of the site to be public via URL
  matching rules.
- Authentication should pass information about the authenticated user to the
  backend for future use-cases.

## Considered Options

- Authenticate against Auth0 in the app layer, which is currently implemented,
  but buggy and would require fixes and additional security review.
- Authenticate against Auth0 in a proxy layer, namely nginx + lua-resty-openidc.

## Decision Outcome

In the GLAM meeting, nginx was chosen as the preferred option for the following
reasons:

- It removes code complexity and maintenance from the app layer.
- It would remove a necessary security review by using something that has
  already been reviewed.
- It offers the quickest path to fix the authentication issues we are facing.
- In the future it satifies the requirement of offering user-facing features.
- In the future it satifies the requirement of optional non-authenticated
  endpoints.

## Links

- [lua-resty-openidc](https://github.com/zmartzone/lua-resty-openidc)
