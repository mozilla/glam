# Use Markdown Architectural Decision Records

- Status: accepted
- Deciders: Hamilton Ulmer, Rob Hudson, (add yourself here)
- Date: 2020-08-31

## Context and Problem Statement

We want to record architectural decisions made in GLAM. Which format and
structure should these records follow?

## Decision Drivers

- Due to changes at Mozilla and Mozilla Data, having a way to onboard new
  developers onto an older project is important
- Practice toward better proposal / decision processes that can be referenced
  later
- The need for more rigor around big choices

## Considered Options

- Do nothing (the status quo)
- [MADR](https://adr.github.io/madr/) 2.1.0 - The Markdown Architectural
  Decision Records

## Decision Outcome

Chosen option: "MADR 2.1.0", because (this is copied from the boilerplate and
slightly adapted)

- ADRs provide us a way of more quickly onboarding new devs onto a complex
  project like GLAM.
- Other teams at Mozilla use ADRs. The social proof is a useful signal.
- Implicit assumptions should be made explicit. Design documentation is
  important to enable people understanding the decisions later on. See also
  [A rational design process: How and why to fake it](https://doi.org/10.1109/TSE.1986.6312940).
- The MADR format is lean and fits our development style. Because of its
  leanness, if this doesn't work out for us, then we will throw it out or
  recycle the content.
- Version 2.1.0 is the latest one available when starting to document ADRs.
