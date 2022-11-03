import gzip
import json
import re
import urllib.request

from django.core.management.base import BaseCommand

from glam.api.models import Probe


EXCLUDED_PROBES_RE = [
    re.compile(x)
    for x in [
        r"histogram/SEARCH_COUNTS",
        r"scalar/browser\.search.*",
        r"scalar/browser\.engagement\.navigation\..*",
    ]
]


class Command(BaseCommand):

    help = "Adds or updates probe data from probe info service."
    PROBES_URL = "https://probeinfo.telemetry.mozilla.org/firefox/all/main/all_probes"

    def handle(self, *args, **kwargs):

        probes = self.extract()
        probes = map(self.transform, probes)

        for probe in probes:
            self.update_probe(probe)

        count = Probe.objects.all().count()
        print("{} probes imported into the database".format(count))

    def get_name(self, name):
        # Returns name with `histogram/` or `scalar/` removed, dots to underscores,
        # and lower case.

        prefix, name = name.split("/")

        if prefix in ["histogram", "scalar"]:
            name = name.replace(".", "_").lower()
            return name
        else:
            return name

    def get_probe_versions(self, channel, probe):
        # Return an array with first version and last version.
        try:
            return [
                probe["history"][channel][-1]["versions"]["first"],
                probe["history"][channel][0]["versions"]["last"],
            ]
        except (KeyError, IndexError):
            return [None, None]

    def get_optout(self, channel, probe):
        # Returns the optout info or None
        try:
            return probe["history"][channel][0]["optout"]
        except (KeyError, IndexError):
            return None

    def extract(self):
        # Read in all probes.
        probes_dict = json.loads(urllib.request.urlopen(self.PROBES_URL).read())
        print("{} probes loaded from probe dictionary".format(len(probes_dict.keys())))

        # Filter probes by histograms or scalars only.
        keys = [
            k for k in probes_dict.keys() if k.startswith(("histogram/", "scalar/"))
        ]
        # Remove any specifically excluded probes.
        keys = [
            k for k in keys if not any((regex.match(k) for regex in EXCLUDED_PROBES_RE))
        ]
        print("{} probes after filters and exclusions".format(len(keys)))

        # Restructure from one global dict to a list of dicts per probe, with `key`
        # being the original probe dict key.
        probes = [dict(probes_dict[k], key=k) for k in keys]

        return probes

    def transform(self, probe):
        # Takes a single probe dict, and returns a Probe object we want to insert.

        latest_history = (
            probe["history"].get("nightly")
            or probe["history"].get("beta")
            or probe["history"].get("release")
        )[0]
        nightly_versions = self.get_probe_versions("nightly", probe)
        name = self.get_name(probe["key"])
        expiry = latest_history.get("expiry_version")

        key = probe["key"]
        info = {
            "name": name,
            "apiName": key,
            "description": latest_history["description"],
            "type": probe["type"],
            "kind": latest_history["details"].get("kind"),
            "labels": latest_history["details"].get("labels"),
            "versions": {
                "nightly": nightly_versions,
                "beta": self.get_probe_versions("beta", probe),
                "release": self.get_probe_versions("release", probe),
            },
            "record_in_processes": latest_history["details"].get(
                "record_in_processes", []
            ),
            "optout": {
                "nightly": self.get_optout("nightly", probe),
                "beta": self.get_optout("beta", probe),
                "release": self.get_optout("release", probe),
            },
            "bugs": latest_history["bug_numbers"],
            # active (bool): TRUE if last recorded nightly version is equal to
            # the latest nightly version.
            "active": expiry == "never"
            or (nightly_versions[1] and int(expiry) > int(nightly_versions[1])),
            # prelease (bool): TRUE if "optout" is false on the "release"
            # channel, i.e., it's recorded by default on all channels.
            "prerelease": self.get_optout("release", probe) is False,
        }

        return {"key": key, "info": info}

    def update_probe(self, p):
        try:
            probe = Probe.objects.get(key=p["key"])
        except Probe.DoesNotExist:
            probe = Probe(key=p["key"])
        probe.info = p["info"]
        probe.save()
