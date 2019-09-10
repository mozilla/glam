To get up and running with a dev environment,

1. _install Docker_. You will need to create a Docker account if you haven't
   already, and [install it](https://docs.docker.com/install/). 
2. _get added to the mdv2 Firebase project_ – ask Rob Hudson (@robhudson) or
   Hamilton Ulmer (@hamilton) over Slack to get you added to the Firebase
   instance.
3. _create a `gcp-app-creds.json` file_ go to firebase console -> settings -> service accounts -> create new private key
4. Take that json file and rename it to `gcp-app-creds.json`. Then put `gcp-app-creds.json` into `api/`
5. go into `api/` and run `make build`.
6. to start the dev server, run `make run` from the same directory.
7. from the top level directory (the one right above `api/`) run `npm run dev`
   to build the frontend.
8. (optional) to run the storybook, run `npm run storybook` from the same
   top-level directory as (7).

We will be streamlining this soon, so bear with us for now.