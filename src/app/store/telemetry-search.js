import { readable } from 'svelte/store';

import FlexSearch from 'flexsearch'
const url = 'https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes'

const resultToProps = (info, id) => {
    const { history } = info;
    let description;
    if (history.release) description = history.release[0].description;
    else if (history.beta) description = history.beta[0].description;
    else description = history.nightly[0].description;
    description = description.split("\n").map(p => `<p>${p}</p>`).join('')
    let firstRelease = info.history.nightly;
    let firstReleaseName = 'nightly';
    if (!firstRelease) {
        firstRelease = info.history.beta;
        firstReleaseName = 'beta';
    }
    firstRelease = firstRelease[firstRelease.length-1].versions.first;
    const out = {
        name: info.name, probeType: info.type, description, id, firstRelease, firstReleaseName
    }
    return out;
}

const telemetrySearch = readable({loaded: false}, async (set) => {
    let data = await fetch(url).then(r=>r.json())
    data = Object.values(data).map(resultToProps)
    const search = new FlexSearch({
        suggest: true,
        encode: "advanced",
        doc: {
            id: 'id',
            field: ['name', 'description', 'probeType']
        }
    })
    search.add(data)
    search.loaded = true;
    set(search);
})



export default telemetrySearch;