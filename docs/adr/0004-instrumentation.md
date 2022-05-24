# Implement instrumentation via a new API Endpoint with external ad hoc probe calculation

- Status: proposed
- Deciders: Christina Harlow, Linh Nguyen, Rob Miller
- Date: 2022-04-05

Technical Story: https://github.com/mozilla/glam/issues/1847

## Context and Problem Statement

In order to help us with various product decisions and overall product quality,
we want to understand how GLAM is normally used: Where does it fit in a typical
user's workflow (a starting point, an endpoint, or something in between)?

We can accomplish this by gathering data such as how a typical user session
looks like, most and least looked at probes, how probe browsing behaves over
short and long periods of time and whether it correlates with other events such
as certain product releases.

Additionally, as a more time-sensitive issue, GLAM ETL does a lot of work and
takes over 8 hours to complete. We intend to reduce GLAM ETL time by finding the
probes that are most likely to be requested by users from the aforementioned
data and have the ETL build only those probes. This document also presents a
plan for ad hoc probe building, which needs to happen when someone requests a
probe that had not been pre-built by the ETL.

## Decision Drivers

- Usage metrics collection must be reliable and cannot be bypassed or influenced
  by other systems such as browsers' ad blockers
- GLAM ETL should consume this service so it can optimize its work, only
  processing probes that are likely to be looked at
- GLAM App should consume this service so it can trigger an ad hoc calculation
  whenever a probe that was not processed by GLAM ETL is requested
- Ad hoc probe building should be independent of GLAM App because it's likely to
  be CPU/memory intensive, with different needs in terms of scalability

## Considered Options

- 1: Collect metrics on the front end (via a library such as Open Telemetry
  Instrumentation or a custom-built solution) and send them to the GLAM back end
  server to be stored in a table in the GLAM App Postgres DB. Expose meaningful
  api endpoints for usage data consumption by GLAM App and GLAM ETL. This
  provides flexibility to adapt to future requirements and "immunity" to
  adblockers, but might be longer to implement
- 2: Use Gleanjs, a JS library for telemetry, which would be quicker than a
  custom implementation. It's also good because of dogfooding and internal
  support. It can be bypassed by adblockers, but we can work around the issue by
  having metrics be sent to a custom endpoint in Glam's domain.
- 3: Google Analytics: currently available, it's quick and easy to implement,
  but doesn't give us the insight into e.g. session-scoped data. We can make it
  resilient against adblockers by sending metrics to our own endpoint, but in
  order to do that we'd have to implemet Google's Measurement Protocol in our
  backend so it can process metrics properly, and even if we achieve that we'd
  still want the current GA to keep working as it is, which involves sending
  metrics to Google's endpoint hence making GA vulnerable to adblockers. One way
  out of this is capture all Glam metrics from GA through a custom endpoint, but
  then this starts to grow way beyond the scope of this work.
- 4: Option #1, but instead of using GLAM's Postgres DB, save metrics to a
  BigQuery table. This would make it easy for the ETL to consume the data, but
  will most likely slow down some GLAM App operations due to BigQuery's
  slower-than-OLTP response times
- 5: Stackdriver + gcloud monitoring tools: This would provide an interface for
  exporting metrics and the ability to create dashboards for visualizing them,
  but since our use case also involves consumption of those metrics by the GLAM
  App and ETL, it might get complicated to parse the response of the gcloud apis
  compared to a custom api from Option #1

## Decision Outcome

### Registering and providing usage data

Chosen option: This choice for a front-end library that records metrics is not
urgent. That said, because both Option #1 and Option #2 meet all Decision
Drivers criteria, if things don't change we will lean towards Gleanjs as a
primary solution and have Open Telemetry as a backup plan in case of any big
hurdles.

### Ad hoc probe building

The only solution proposed for this is the Asynchronous Request-Reply Pattern
(link in the Links section), in which the worker is an external cloud component
(tbd) that:

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
- [Open Telemetry Instrumentation][https://opentelemetry.io/docs/instrumentation/js/instrumentation/]
- [Asynchronous Request-Reply
  Pattern][https://docs.microsoft.com/en-us/azure/architecture/patterns/async-request-reply]
