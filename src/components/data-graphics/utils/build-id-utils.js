import { timeFormat, timeParse } from "d3-time-format";

const dtFormatter = timeFormat("%Y%m%d");
const dtParser = timeParse("%Y%m%d");
const parse = build => dtParser(build.slice(0, 8));

const toBuildObj = build => ({
  build,
  truncated: build.slice(0, 8),
  dt: parse(build)
});

export function buildIDToDate(buildID) {
  return parse(buildID);
}

export function dateToBuildID(scale, dt) {
  return scale.domain().find(d => d.slice(0, 8) === dtFormatter(dt));
}

export function getFirstBuildOfDays(scale) {
  // returns the first build ids for each day
  const domain = scale.domain().map(toBuildObj);
  domain.sort((a, b) => {
    if (a.build < b.build) return -1;
    if (a.build >= b.build) return 1;
    return 0;
  });
  const seenDates = new Set([]);
  const firstBuilds = [];
  domain.forEach(({ truncated, build }) => {
    if (!seenDates.has(truncated)) {
      seenDates.add(truncated);
      firstBuilds.push(build);
    }
  });
  return firstBuilds;
}

export function mondays(scale) {
  const firstBuilds = getFirstBuildOfDays(scale);
  return firstBuilds
    .map(toBuildObj)
    .filter(({ dt }) => dt.getDay() === 1)
    .map(({ build }) => build);
}

export function firstOfMonth(scale) {
  return getFirstBuildOfDays(scale).filter(
    buildID => buildID.slice(6, 8) === "01"
  );
}

export function buildIDToMonth(buildID) {
  return timeFormat("%b %d")(parse(buildID));
}

/*

const ordDate = ordinalDateScale()
  .domain([...values]).range([100, 500]);

here, we need to call ordDate.toOrdinal(new Date('2019-09-24')) to get the
ordinal value we need.

*/
