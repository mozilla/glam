# Implement instrumentation via a new API Endpoint with external ad hoc probe calculation

- Status: proposed
- Deciders: Christina Harlow, Linh Nguyen, Rob Miller
- Date: [2022-04-05

Technical Story: https://github.com/mozilla/glam/issues/1847

## Context and Problem Statement

GLAM ETL does a lot of work and takes over 12 hours to complete. We suspect that
we can can optmize the ETL by only building probes that are likely to be
requested. As part of a bigger scope, we also want to understand how GLAM is
normally used: Where does it fit in a typical user's workflow (a starting point,
an endpoint, or something in between)? In order to accomplish that we must
gather data such as most and least looked at probes, how a typical user session
looks like, how probe browsing behaves over short and long periods of time and
whether it correlates with other events such as product releases.

## Decision Drivers

- Usage metrics collection must be reliable and cannot be bypassed or influenced
  by other systems such as browsers' adblocks
- GLAM ETL should consume this service so it can optimize its work, only
  processing probes that are likely to be looked at
- GLAM App should consume this service so it can trigger an ad hoc calculation
  whenever a probe that was not processed by GLAM ETL is requested
- Ad hoc probe calculation should be independent of GLAM App because it's likely
  to be CPU/memory intensive, with different needs in terms of scalability

## Considered Options

- 1: Collect metrics in the app's backend server, save them to a table in the
  GLAM App Postgres DB and expose meaningful api endpoints for consumption by
  GLAM App and and GLAM ETL, which provides flexibility to adapt to future
  requirements and "immunity" to adblocks, but takes longer to implement
- 2: Gleanjs for dogfooding and internal support, but can be bypassed by
  adblockers
- 3: Google analytics, currently available, because it's quick and easy but
  doesn't give us the insight into e.g. session-scoped data and can also be
  bypassed by adblockers
- 4: Collect metrics in the app's backend and save them to a BigQuery table,
  which makes it easy for the ETL to consume, but will most likely slow down
  some GLAM App operations due to BigQuery's slower-than-OLTP response times
- 5: Stackdriver + gcloud monitoring tools, which provide an interface for
  exporting metrics and ability to create dashboards for visualizing them, but
  since our use case also involves consumption of those metrics by the GLAM App
  and ETL, it might get complicated to parse the response of the gcloud apis
  compared to a custom api from e.g. Option #1

## Decision Outcome

### Registering and providing usage data

Chosen option: Option #1, because it meets all Decision Drivers criteria and
gives the best performance and evolvability:

- It's "immune" to adblocks, because it's in the backend of the app
- API can be easily consumed by GLAM App and GLAM ETL
- Performance: Data inserted to and fetched from Postgresql db is unlikely to
  cause any significant latency increase
- Evolvability: We can easily change/create api endpoints to meet our future
  needs

### Ad hoc probe building

The solution proposed for this is the Asynchronous Request-Reply Pattern (link
in the Links section), in which the worker is an external cloud component (tbd)
that:

- Accesses BigQuery tables for building the needed probes
- Saves the built probes to the appropriate tables in Postgres
- Communicates with the GLAM App through a "status" table, also in Postgres

For a visual picture of the complete solution with a description of the most
relevant flows, please refer to the diagram link below

## Links

<!-- Just so prettier doesn't lower-case the following link's characters: -->
<!-- prettier-ignore -->
- [Solution
  Diagram][https://docs.google.com/document/d/1Vchl9q9BoeZU9UFioROXCVPdi488mxnJeGy2uL-Hv4o/edit?usp=sharing]
- [Asynchronous Request-Reply
  Pattern][https://docs.microsoft.com/en-us/azure/architecture/patterns/async-request-reply]
