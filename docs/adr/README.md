# GLAM Architectural Decision Records (ADRs)

We use ADRs to capture important engineering decisions made.
For more information, see [this ADR explanation](https://adr.github.io/).

We use [MADRs (markdown ADRs)](https://adr.github.io/madr/). To contribute a new
ADR,

1. copy `template.md` into a new file in this directory in the format
   `nnnn-title-with-dashes.md`. The `nnnn` should be the next number up from
   the highest number in the ADRs in this directory.
2. fill out the template.
3. once done, run node scripts/update-adrs to generate a new index.
4. file a PR with these changes as a branch in the GLAM repository.

## Accepted ADRs

- [0000-use-madr.md](/docs/adr/0000-use-madr.md)
- [0001-auth-via-nginx.md](/docs/adr/0001-auth-via-nginx.md)

