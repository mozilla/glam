import R from './wow.json';

// join on start_date_etl
const key = 'start_date_etl';
const pivot = 'app_name';
const uniqueKeys = Array.from(new Set(R.map((r) => r[key])));

uniqueKeys.sort();

const out = [];
// console.log(new Set(R.map((r) => `${r.category_segment_group}`)));
// for each unique date, collect all points.
uniqueKeys.forEach((d) => {
  const rows = R.filter((r) => r[key] === d);
  const newRow = {};
  rows.forEach((r) => {
    // get keys
    const p = r[pivot];
    const keys = Object.keys(r);
    keys.forEach((k) => {
      if (k !== key && k !== pivot) {
        newRow[`${p}_${k}`] = Number(r[k]);
      }
      if (k === key) newRow[k] = r[k];
    });
  });
  out.push(newRow);
});

out.forEach((o) => { o.date = new Date(o[key]); });

export default out;
