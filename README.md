# autobattler-frontend

This project needs some environment variables to be set. If you're working locally, create a ".env" file in the root
directory with the following variables:
If you're deploying to GitHub pages, create secrets for the following variables in your GitHub repository:

- REACT_APP_FETCH_CALL_DOMAIN
    - The domain to use for fetch calls. (e.g. "http://localhost:8080/api"). it's important that you don't have a "/" at
      the end.