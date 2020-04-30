# Deployment

GLAM has a 3-stage deployment:

1. **Dev**: Deployments to the development server happen automatically for all commits that land on the `master` branch
2. **Stage**: Deployments to the staging server happen automatically for tags of the form `m<integer>` or of the [CalVer](http://calver.org/) format `YYYY.MM.N` where `N` is a zero-based counter for the number of tags during the month
3. **Production**: TBD

## Tagging for release

The steps for tagging a release for the staging server are as follows:

1. Ensure that the development server is working as intended
2. Update the `CHANGELOG.md` file, adding the tag name and ensuring the changelog notes are up to date
3. Tag a release locally in git via: `git tag <tag>`
4. Push the tag to github via: `git push origin --tags`

## Logs

The results of the deploy will be logged to the **#datatools-deploys** channel
on Slack.
