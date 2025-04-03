# Deployment

GLAM has a 3-stage deployment:

1. **Dev**: Deployments to the development environment happen automatically for
   all commits that land on the `main` branch
2. **Stage**: Deployments to the staging environment happen automatically for
   tags of the [SemVer](http://semver.org/) format `vYYYY.MM-rcN` where `N` is a
   zero-based counter for the number of tags during the month. e.g.:
   `v2025.01-rc0` means this is the first release candidate of Jan 2025.
3. **Production**: Deployments to the production environment happen
   automatically for tags of the [SemVer](http://semver.org/) format
   `vYYYY.MM.N` where `N` is a zero-based counter for the number of tags during
   the month. e.g.: `v2025-01.0` means this is the first release of Jan 2025.

   Notice that the `N` in Production tags is not necessarily the same as in the
   Stage tags, as there might be, for example, five release candidates and in a
   month and only one relese, which would make their latest tags `2025.01-rc4`
   and `2025.01.0`, respectively.

## Tagging for release

The steps for tagging a release for the staging server are as follows:

1. Ensure that the development server is working as intended by testing it in
   dev first
2. Tag a release locally in git via: `git tag <tag>` or use the [github releases
   functionality] (https://github.com/mozilla/glam/releases) to create a tag at
   the same time as a release
3. If you created a tag locally, push the tag to github via:
   `git push origin --tags` and create a release from that tag using the [github
   releases functionality] (https://github.com/mozilla/glam/releases)
4. **Important** make sure to generate release notes.
5. Ask someone or follow the pattern in the most recent releases on the repo in
   case of doubt :)

## Logs

- The results of the deploy will be logged to the **#datatools-deploys** channel
  on Slack.

## How to view the import logs in Google Cloud Platform console

1. Log into the GCP console web page using authorized credentials
2. Make sure you're in the "glam-prod" project
3. Drill down into the "Kubernetes Engine -> Workloads"
4. Look for the one that says name="glam-prod-glam-app-1" type="Cron job" and
   click the name
5. Select the "Logs" tab along the top. From there you can see all the recent
   logging from the imports which are run via cron.
