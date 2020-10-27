# Provide options for further data exploration

- Status: accepted
- Deciders: Rob Miller, Rob Hudson, Hamilton Ulmer
- Date: 2020-10-07

## Context and Problem Statement

GLAM is designed to answer a general set of questions against a limited set of
dimensions. Sometimes the underlying data can tell us more than GLAM allows. For
those users who want to dig deeper into the data, GLAM should provide jump off
points to do so.

## Decision Drivers

- What is best to provide to end users to get their questions answered?
- What can we accomplish with our current resources for the generalized case,
  but also help enable non-generalized use cases?

## Considered Options

Currently we provide the JSON representation of the data being displayed as an
"Export to JSON" link

Extra options we can provide:

1. We could provide other alternate data file formats (e.g. CSV)
2. We could provide the SQL to query the current set of data being displayed to
   the user which can then be copy/pasted into Redash or BQ console as a
   starting point for further exploration
3. We could link directly to Redash with the query pre-populated

## Decision Outcome

Chosen option: 2. Copy-paste-able SQL query

It was decided that option 2 was the best and most useful option. Option 1 has
not been requested thus far. Option 3's tight integration with Redash was deemed
unwise as Redash has an unknown future at Mozilla and the SQL query could be
easily copied there as well as the bigquery console.

## Pros and Cons of the Options

### 1. Provide alternate file formats

- Pro: Simple to implement and add to the current user interface

### 2. Provide SQL for current data

- Pro: Simple to implement
- Pro: Gives end-user flexibility to tweak and dig deeper

### 3. Redash link with query provided

- Pro: Least amount of clicks or end-user actions
- Con: Ties us to a specific tool
- Con: May or may not be possible to do this
