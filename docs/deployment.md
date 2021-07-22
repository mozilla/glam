# Deployment

GLAM has a 3-stage deployment:

1. **Dev**: Deployments to the development server happen automatically for all
   commits that land on the `main` branch
2. **Stage**: Deployments to the staging server happen automatically for tags of
   the form `m<integer>` or of the [CalVer](http://calver.org/) format
   `YYYY.MM.N` where `N` is a zero-based counter for the number of tags during
   the month
3. **Production**: File a Jira ticket with the label GLAM in Data SRE board to
   deploy to production. See example ticket:
   https://mozilla-hub.atlassian.net/browse/DSRE-8

## Tagging for release

The steps for tagging a release for the staging server are as follows:

1. Ensure that the development server is working as intended
2. Update the `CHANGELOG.md` file:

- Update any changelog entries based on git history:
  - View git history since the last tag either by using compare link or via git
    locally:
    - `git log $(git describe --tags --abbrev=0)..HEAD --oneline`
- Copy/paste the "unreleased" header for editing, leaving an unreleased header
  for future updates
- Update the pasted "unreleased" header with the following:
  - Add the appropriate tag name
  - Update the Github compare link replacing "HEAD" with the tag being created
  - Include the date that the tag was created
- Update the top "unreleased" header to compare from tag being made to HEAD

3. Tag a release locally in git via: `git tag <tag>`
4. Push the tag to github via: `git push origin --tags`

## How to view the import logs in Google Cloud Platform console

1. Log into the GCP console web page using authorized credentials
2. Make sure you're in the "glam-prod" project
3. Drill down into the "Kubernetes Engine -> Workloads"
4. Look for the one that says name="glam-prod-glam-app-1" type="Cron job" and
   click the name
5. Select the "Logs" tab along the top. From there you can see all the recent
   logging from the imports which are run via cron.
