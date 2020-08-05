# Authentication

## User interface feedback before authentication

### Steps

1. Close any open Firefox private windows
2. Open a Firefox private window
3. Use developer tools to throttle the internet connection to _Good 3G_ or
   _Regular 4G / LTE_ (this will help when evaluating the acceptance criteria)
4. Navigate to [http://localhost:5000](http://localhost:5000)

### Acceptance criteria

- The GLAM header and logo are visible before the redirect to Auth0
- The GLAM body shows a spinner before the redirect to Auth0

## Reloading a probe page

1. Close any open Firefox private windows
2. Open a Firefox private window
3. Navigate to [http://localhost:5000](http://localhost:5000)
4. Authenticate
5. Navigate to any probe that has data
6. Wait for the probe to load successfully
7. Reload the page

### Acceptance criteria

- The probe loads successfully after the page is reloaded

## Preserving important details when authenticating from a path

### Steps

1. Close any open Firefox private windows
2. Open a Firefox private window
3. Navigate to
   [http://localhost:5000/firefox/probe/gc_ms/explore](http://localhost:5000/firefox/probe/gc_ms/explore)
4. Authenticate
5. Change the _OS_ and _Process_. Make note of the new values.
6. Copy the URL
7. Close the private window
8. Open a new private window
9. Paste the URL that was copied in step 6 and navigate to it
10. Authenticate

### Acceptance criteria

- Authentication is successful in steps 4 and 10
- After step 10, you are returned to the _gc_ms_ probe
- After step 10, the _OS_ and _Probe_ that were selected earlier are set

## Browser navigation works as expected with probe that has no data

### Steps

1. Close any open Firefox private windows
2. Open a Firefox private window
3. Navigate to [http://localhost:5000](http://localhost:5000)
4. Authenticate
5. Navigate to any probe that does not have data with the default dimensions set
   (at the time of this writing, _gfx_crash_ is one option)
6. Use the browser's back button
7. Wait for the homepage to fully load
8. Use the browser's forward button

### Acceptance criteria

- The probe still does not show any data

## Browser navigation works as expected with probe that has does have data

### Steps

1. Close any open Firefox private windows
2. Open a Firefox private window
3. Navigate to [http://localhost:5000](http://localhost:5000)
4. Authenticate
5. Navigate to any probe that does have data with the default dimensions set (at
   the time of this writing, _gc_ms_ is one option). Make note of the general
   shape of the data that is shown.
6. Use the browser's back button
7. Wait for the homepage to fully load
8. Use the browser's forward button

### Acceptance criteria

- The probe shows the same data that it did in step 5

## Store reset does not affect loading of probe that has does have data

### Steps

1. Close any open Firefox private windows
2. Open a Firefox private window
3. Navigate to [http://localhost:5000](http://localhost:5000)
4. Authenticate
5. Navigate to any probe that does have data with the default dimensions set (at
   the time of this writing, _gc_ms_ is one option). Make note of the general
   shape of the data that is shown.
6. Click the GLAM logo
7. Wait for the homepage to fully load
8. Use the browser's back button

### Acceptance criteria

- The probe shows the same data that it did in step 5
  - Note: There may be a small delay before the data reloads after step 8
    because the store is reset when the GLAM logo is clicked, removing
    previously-downloaded data

## Authentication succeeds when ETP is enabled on Firefox Nightly

**NOTE:** This test is expected to fail until
[Issue #717](https://github.com/mozilla/glam/issues/717) is fixed

### Steps

1. Close any open Firefox Nightly windows
2. Open Firefox Nightly
3. Ensure that ETP is enabled and that no exception is set for
   [http://localhost:5000](http://localhost:5000)
4. Open a private Firefox Nightly window
5. Navigate to [http://localhost:5000](http://localhost:5000)

### Acceptance criteria

- Authentication is successful and the GLAM homepage loads
